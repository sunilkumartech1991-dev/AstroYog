from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Wallet


@receiver(post_save, sender=User)
def create_welcome_bonus(sender, instance, created, **kwargs):
    """Give welcome bonus to new users"""
    if created and instance.user_type == 'customer':
        # Create welcome bonus transaction
        Wallet.objects.create(
            user=instance,
            transaction_type='credit',
            amount=100.00,  # ₹100 welcome bonus
            balance_after=100.00,
            status='success',
            description='Welcome bonus',
            reference_id=f'WELCOME_{instance.id}',
            payment_method='bonus'
        )
        # Update user wallet balance
        instance.wallet_balance = 100.00
        instance.save(update_fields=['wallet_balance'])
