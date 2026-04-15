
from urllib import request
from rest_framework.views import APIView
from django.core.mail import send_mass_mail
from django.conf import settings
from .serializers import EventOrderSerializer,BulkEmailSerializer

# orders/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Order, OrderItem, TicketCategory, Ticket
from .serializers import OrderSerializers, TicketSerializer
from rest_framework.permissions import AllowAny
from django.utils import timezone


from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

import os

def send_order_confirmation_email(order, request):
    """
    Send order confirmation email with ticket images attached as files

    """
    try:
        user_email = order.user.email
        user_name = order.user.first_name or order.user.username
        event_name = order.event.title
        event_date = order.event.date
        event_location = order.event.location
        
        # Email subject
        subject = f'Ticket Confirmation - {event_name}'
        
        # Get all tickets for this order
        tickets = []
        ticket_files = []  # Store file paths for attachments
        files_to_delete = []  # Store all files to delete after email sent
        
        for item in order.items.all():
            for ticket in item.tickets.all():
                ticket_data = {
                    'ticket_number': ticket.ticket_number,
                    'category': item.ticket_category.name,
                }
                tickets.append(ticket_data)
                
                # ONLY collect ticket image (NOT QR code)
                if ticket.ticket_image:
                    ticket_files.append({
                        'path': ticket.ticket_image.path,
                        'name': f'ticket_{ticket.ticket_number}.png'
                    })
                    

        
        # Create HTML email body
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .ticket {{ border: 2px solid #ddd; margin: 20px 0; padding: 15px; background-color: white; }}
                .footer {{ margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                .alert {{ background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }}
                .instructions {{ margin-top: 30px; padding: 20px; background-color: #e3f2fd; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Your Ticket is Confirmed!</h1>
                </div>
                
                <div class="content">
                    <h2>Hello {user_name},</h2>
                    <p>Thank you for purchasing tickets for <strong>{event_name}</strong>!</p>
                    
                    <div class="alert">
                        <strong>⏰ Important:</strong> Please arrive <strong>30 minutes earlier</strong> than the event start time.
                    </div>
                    
                    <h3>Event Details:</h3>
                    <ul>
                        <li><strong>Event:</strong> {event_name}</li>
                        <li><strong>Date:</strong> {event_date}</li>
                        <li><strong>Location:</strong> {event_location}</li>
                        <li><strong>Order ID:</strong> {order.id}</li>
                        <li><strong>Total Amount:</strong> ${order.total_amount}</li>
                    </ul>
                    
                    <h3>Your Tickets:</h3>
        """
        
        # Add each ticket info
        for idx, ticket in enumerate(tickets, 1):
            html_content += f"""
                    <div class="ticket">
                        <h4>Ticket #{idx} - {ticket['category']}</h4>
                        <p><strong>Ticket Number:</strong> {ticket['ticket_number']}</p>
                        <p><em>Your ticket image is attached to this email.</em></p>
                    </div>
            """
        
        html_content += f"""
                    <div class="instructions">
                        <h3>📋 Instructions:</h3>
                        <ol>
                            <li><strong>Arrive 30 minutes before the event starts</strong></li>
                            <li>Bring a valid ID for verification</li>
                            <li>Show your ticket at the entrance for scanning</li>
                            <li>Download and save the attached ticket images</li>
                            <li>Keep this email for your records</li>
                        </ol>
                    </div>
                    
                    <p style="margin-top: 30px; padding: 15px; background-color: #d4edda; border-radius: 5px;">
                        <strong>📎 Your tickets are attached to this email</strong><br>
                        Please check the attachments and download them to your device.
                    </p>
                </div>
                
                <div class="footer">
                    <p>If you have any questions, please contact us.</p>
                    <p>Thank you for choosing Vardaan Wear Events!</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
Hello {user_name},

Your ticket for {event_name} is confirmed!

⏰ IMPORTANT: Please arrive 30 minutes earlier than the event start time.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Location: {event_location}
- Order ID: {order.id}
- Total Amount: ${order.total_amount}

Your Tickets:
"""
        
        for idx, ticket in enumerate(tickets, 1):
            text_content += f"""
Ticket #{idx}
- Category: {ticket['category']}
- Ticket Number: {ticket['ticket_number']}
"""
        
        text_content += """

Instructions:
1. Arrive 30 minutes before the event
2. Bring a valid ID
3. Show your ticket at entrance
4. Download the attached ticket images

Your tickets are attached to this email.

Thank you!
Vardaan Wear Events
        """
        
        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        
        # Attach HTML content
        email.attach_alternative(html_content, "text/html")
        
        # Attach ONLY ticket image files (NOT QR codes)
        for ticket_file in ticket_files:
            if os.path.exists(ticket_file['path']):
                with open(ticket_file['path'], 'rb') as f:
                    email.attach(ticket_file['name'], f.read(), 'image/png')
        
        # Send email
        email.send(fail_silently=False)
        

        
        return True
        
    except Exception as e:
        print(f"Error sending confirmation email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
class OrderViewSet(viewsets.ModelViewSet):
    authentication_classes = []
    permission_classes = [AllowAny]
    queryset = Order.objects.all()
    serializer_class = OrderSerializers
    # created by ahmed (11/26/2025 at 2 AM)
    @action(detail=False, methods=['get'], url_path='event-attendees')
    def get_event_attendees_with_user_info(self, request):
        """
        Get all attendees for a specific event with user information
        GET /api/order/orders/event-attendees/?event_id=123
        """
        event_id = request.query_params.get('event_id')
        
        if not event_id:
            return Response(
                {'error': 'event_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all orders for this event
        orders = Order.objects.filter(
            event_id=event_id
        ).select_related('user', 'event').prefetch_related('items__ticket_category', 'items__tickets')
        
        attendee_data = []
        for order in orders:
            for item in order.items.all():
                # Create one entry per ticket (or per quantity)
                for i in range(item.quantity):
                    attendee_data.append({
                        'order_id': order.id,
                        'user_id': order.user.id,
                        'user_name': order.user.username,
                        'user_email': order.user.email,
                        'first_name': order.user.first_name,
                        'last_name': order.user.last_name,
                        'event_id': order.event.id,
                        'event_title': order.event.title,
                        'ticket_category_id': item.ticket_category.id,
                        'ticket_category_name': item.ticket_category.name,
                        'ticket_price': float(item.price),
                        'quantity': 1,  # Each entry represents one ticket
                        'order_status': order.status,
                        'purchase_date': order.created_at,
                        'payment_method': order.payment_method,
                        'total_amount': float(order.total_amount),
                    })
        
        return Response(attendee_data, status=status.HTTP_200_OK)



    @action(detail=False, methods=['get'], url_path='organizer-tickets')
    def get_organizer_tickets_with_user_info(self, request):
        """
        Get organizer tickets with user email information
        GET /api/order/orders/organizer-tickets/?organizer_id=123
        """
        organizer_id = request.query_params.get('organizer_id')
        
        if not organizer_id:
            return Response(
                {'error': 'organizer_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = Order.objects.filter(
            event__organizer_id=organizer_id
        ).select_related('user', 'event').prefetch_related('items__tickets')
        
        ticket_data = []
        for order in orders:
            for item in order.items.all():
                for ticket in item.tickets.all():
                    ticket_data.append({
                        'id': ticket.id,
                        'ticket_number': ticket.ticket_number,
                        'status': ticket.status,
                        'event_id': order.event.id,   # Required for filtering by event
                        'price': item.price,          # Required for revenue calcu
                        'event_name': order.event.title,
                        'category_name': item.ticket_category.name,
                        'user_email': order.user.email,
                        'user_name': order.user.username,
                        'created_at': ticket.created_at,
                        'scanned_at': ticket.scanned_at,
                        'ticket_image_url': request.build_absolute_uri(ticket.ticket_image.url) if ticket.ticket_image else None,
                        'qr_code_url': request.build_absolute_uri(ticket.qr_code.url) if ticket.qr_code else None,
                    })
        
        return Response(ticket_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='tickets')
    def get_tickets(self, request):
        """
        Get tickets for organizer's events
        GET /api/order/orders/tickets/?organizer_id=123
        """
        organizer_id = request.query_params.get('organizer_id')
        
        if not organizer_id:
            return Response(
                {'error': 'organizer_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filter tickets for events created by this organizer
        tickets = Ticket.objects.filter(
            order_item__order__event__organizer_id=organizer_id
        ).select_related(
            'order_item__order__event',
            'order_item__ticket_category'
        )
        
        serializer = TicketSerializer(tickets, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        order_data = request.data.copy()
        items_data = order_data.pop('tickets', [])
        
        # Create order
        order_serializer = OrderSerializers(data={
            'user': order_data.get('user'),
            'event': order_data.get('event'),
            'payment_method': order_data.get('payment_method'),
            'total_amount': order_data.get('total_amount'),
        })
        order_serializer.is_valid(raise_exception=True)
        order = order_serializer.save()
        
        # Create order items and generate tickets
        for item in items_data:
            try:
                ticket_category = TicketCategory.objects.get(
                    name=item['ticket_category'],
                    event=order.event
                )
                
                if ticket_category.quantity < item['quantity']:
                    return Response(
                {'error': f"Only {ticket_category.quantity} tickets left for '{ticket_category.name}'"},
                status=status.HTTP_400_BAD_REQUEST
            )


                ticket_category.quantity_sold += item['quantity']
                ticket_category.quantity -= item['quantity']
                ticket_category.save()
                order_item = OrderItem.objects.create(
                    order=order,
                    ticket_category=ticket_category,
                    quantity=item['quantity'],
                    price=item['price']
                )
                
                # Generate individual tickets
                order_item.generate_tickets()
                
            except TicketCategory.DoesNotExist:
                return Response(
                    {'error': f"Ticket category '{item['ticket_category']}' not found for this event"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Send confirmation email with tickets
        email_sent = send_order_confirmation_email(order, request)
    
        # Return order with tickets
        serializer = OrderSerializers(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='scan-ticket')
    def scan_ticket(self, request):
        """
            Scan a ticket by QR code with event validation
            POST /api/order/orders/scan-ticket/?event_id=<event_id>
            Body: {"ticket_id": "uuid" or "ticket_number": "string"}
        """
        ticket_id = request.data.get('ticket_id')
        event_id = request.query_params.get('event_id')
        
        # Validate event_id is provided
        if not event_id:
            return Response({
                'success': False,
                'message': 'event_id parameter is required in URL'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate ticket_id is provided
        if not ticket_id:
            return Response({
                'success': False,
                'message': 'ticket_id is required in request body'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to find ticket by ID first, then by ticket_number
            try:
                ticket = Ticket.objects.select_related(
                    'order_item__order__event'
                ).get(id=ticket_id)
            except:
                ticket = Ticket.objects.select_related(
                    'order_item__order__event'
                ).get(ticket_number=ticket_id)
            
            # Validate ticket belongs to the specified event
            ticket_event_id = str(ticket.order_item.order.event.id)
            if ticket_event_id != str(event_id):
                return Response({
                    'success': False,
                    'message': f'This ticket does not belong to this event. This ticket is for: {ticket.order_item.order.event.title}',
                    'ticket_event': ticket.order_item.order.event.title,
                    'ticket_event_id': ticket_event_id
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if ticket is already used
            if ticket.status == 'used':
                return Response({
                    'success': False,
                    'message': 'This ticket has already been used',
                    'scanned_at': ticket.scanned_at,
                    'ticket': TicketSerializer(ticket, context={'request': request}).data
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if ticket is cancelled
            if ticket.status == 'cancelled':
                return Response({
                    'success': False,
                    'message': 'This ticket has been cancelled',
                    'ticket': TicketSerializer(ticket, context={'request': request}).data
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark ticket as used
            ticket.status = 'used'
            ticket.scanned_at = timezone.now()
            ticket.save()
            
            return Response({
                'success': True,
                'message': 'Ticket scanned successfully',
                'ticket': TicketSerializer(ticket, context={'request': request}).data,
                'user_name': ticket.order_item.order.user.username,
                'user_email': ticket.order_item.order.user.email
            }, status=status.HTTP_200_OK)
            
        except Ticket.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid ticket - ticket not found'
            }, status=status.HTTP_404_NOT_FOUND)

class EventOrdersView(APIView):
    permission_classes = [AllowAny] 
    """
    Get all orders for a specific event with user info and ticket names
    URL: /api/order/orders/event/<event_id>/
    """
    def get(self, request, event_id):
        orders = Order.objects.filter(event_id=event_id)
        serializer = EventOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SendEventEmailView(APIView):
    permission_classes = [AllowAny]  # Change this to appropriate permission
    
    def post(self, request):
        """
        Send bulk email to all users who bought tickets for a specific event
        POST /api/orders/event/email_all/
        Body: {
            "event_id": "123",
            "subject": "Event Update",
            "body": "Your message here"
        }
        """
        serializer = BulkEmailSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event_id = serializer.validated_data['event_id']
        subject = serializer.validated_data['subject']
        body = serializer.validated_data['body']
        
        # Get all unique users who bought tickets for this event
        orders = Order.objects.filter(event_id=event_id).select_related('user')
        
        if not orders.exists():
            return Response(
                {'message': 'No orders found for this event'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get unique user emails
        user_emails = set()
        for order in orders:
            if order.user and order.user.email:
                user_emails.add(order.user.email)
        
        if not user_emails:
            return Response(
                {'message': 'No valid email addresses found for attendees'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prepare emails for bulk sending
        from_email = settings.DEFAULT_FROM_EMAIL
        messages = [
            (subject, body, from_email, [email])
            for email in user_emails
        ]
        
        try:
            # Send emails
            sent_count = send_mass_mail(messages, fail_silently=False)
            
            return Response({
                'success': True,
                'message': f'Email sent successfully to {len(user_emails)} attendees',
                'emails_sent': sent_count,
                'recipients': list(user_emails)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to send emails: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)