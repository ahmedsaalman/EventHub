from django.db import models
from django.conf import settings
import uuid
from events.models import Event, TicketCategory
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image, ImageDraw, ImageFont
import requests

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('card', 'Card'),
        ('bank', 'Bank Transfer'),
        ('jazzcash', 'JazzCash'),
        ('easypaisa', 'EasyPaisa'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders_order_app')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='orders_order_app')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# orders/models.py - Update OrderItem
class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    ticket_category = models.ForeignKey(TicketCategory, on_delete=models.CASCADE, related_name='order_items_order_app')
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def generate_tickets(self):
        """Generate individual tickets for this order item"""
        tickets = []
        for i in range(self.quantity):
            ticket_number = f"{self.order.event.title[:3].upper()}-{self.ticket_category.name[:3].upper()}-{uuid.uuid4().hex[:8].upper()}"
            
            ticket = Ticket.objects.create(
                order_item=self,
                ticket_number=ticket_number,
                status='valid'
            )
            
            # Generate QR code and ticket image
            ticket.generate_qr_code()
            ticket.generate_ticket_image()
            ticket.save()
            
            tickets.append(ticket)
        
        return tickets
    
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('valid', 'Valid'),
        ('used', 'Used'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey('OrderItem', on_delete=models.CASCADE, related_name='tickets')
    ticket_number = models.CharField(max_length=50, unique=True)
    qr_code = models.ImageField(upload_to='tickets/qr_codes/', blank=True)
    ticket_image = models.ImageField(upload_to='tickets/images/', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='valid')
    scanned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Ticket {self.ticket_number}"
    
    def generate_qr_code(self):
        """Generate QR code for this ticket"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(str(self.id))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Save to model
        self.qr_code.save(f'qr_{self.id}.png', File(buffer), save=False)
        buffer.close()
    
    def generate_ticket_image(self):
        """Generate full ticket image with QR code, event details, and category"""
      
        width, height = 800, 400
        ticket_img = Image.new('RGB', (width, height), color='#1a1a2e')
        draw = ImageDraw.Draw(ticket_img)
      
        try:
            title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
            normal_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
            small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        except:
            title_font = ImageFont.load_default()
            normal_font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        # Get event and ticket info
        event = self.order_item.order.event
        category = self.order_item.ticket_category
        
        # Download and paste event image (left side)
        try:
            if event.image_url:
                response = requests.get(event.image_url, timeout=5)
                event_image = Image.open(BytesIO(response.content))
                event_image = event_image.resize((300, 400))
                ticket_img.paste(event_image, (0, 0))
        except:
            pass
        
        # Right side content area
        content_x = 320
        
        # Draw ticket category badge
        badge_color = category.color if hasattr(category, 'color') else '#9333ea'
        draw.rectangle([content_x, 20, content_x + 200, 70], fill=badge_color)
        draw.text((content_x + 100, 45), category.name.upper(), fill='white', 
                  font=normal_font, anchor='mm')
        
        # Event title
        draw.text((content_x, 90), event.title[:30], fill='white', font=title_font)
        
        # Event details
        draw.text((content_x, 140), f"Date: {event.date}", fill='#cccccc', font=normal_font)
        draw.text((content_x, 170), f"Time: {event.time}", fill='#cccccc', font=normal_font)
        draw.text((content_x, 200), f"Venue: {event.location[:25]}", fill='#cccccc', font=small_font)
        
        # Ticket number
        draw.text((content_x, 240), f"Ticket: {self.ticket_number}", fill='#9333ea', font=small_font)
        
        # Add QR code
        if self.qr_code:
            try:
                qr_img = Image.open(self.qr_code.path)
                qr_img = qr_img.resize((120, 120))
                ticket_img.paste(qr_img, (content_x + 320, 250))
            except:
                pass
        
        # Save ticket image
        buffer = BytesIO()
        ticket_img.save(buffer, format='PNG')
        buffer.seek(0)
        
        self.ticket_image.save(f'ticket_{self.id}.png', File(buffer), save=False)
        buffer.close()
