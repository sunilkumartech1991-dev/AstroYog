"""
PayU Payment Gateway Integration Helper
"""
import hashlib
from django.conf import settings
import uuid


class PayUHelper:
    """Helper class for PayU payment gateway integration"""

    @staticmethod
    def generate_transaction_id():
        """Generate unique transaction ID"""
        return f"ASTRO_{uuid.uuid4().hex[:12].upper()}"

    @staticmethod
    def generate_hash(data):
        """
        Generate PayU hash for payment verification
        Hash formula: sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
        """
        merchant_key = settings.PAYU_MERCHANT_KEY
        salt = settings.PAYU_MERCHANT_SALT

        hash_string = (
            f"{merchant_key}|{data['txnid']}|{data['amount']}|"
            f"{data['productinfo']}|{data['firstname']}|{data['email']}|||||||||||{salt}"
        )

        return hashlib.sha512(hash_string.encode('utf-8')).hexdigest()

    @staticmethod
    def verify_hash(payu_response):
        """
        Verify hash from PayU response
        Hash formula: sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
        """
        merchant_key = settings.PAYU_MERCHANT_KEY
        salt = settings.PAYU_MERCHANT_SALT

        hash_string = (
            f"{salt}|{payu_response.get('status')}|||||||||||"
            f"{payu_response.get('email')}|{payu_response.get('firstname')}|"
            f"{payu_response.get('productinfo')}|{payu_response.get('amount')}|"
            f"{payu_response.get('txnid')}|{merchant_key}"
        )

        generated_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest()
        received_hash = payu_response.get('hash', '')

        return generated_hash == received_hash

    @staticmethod
    def get_payu_url():
        """Get PayU URL based on mode"""
        if settings.PAYU_MODE == 'live':
            return 'https://secure.payu.in/_payment'
        else:
            return 'https://test.payu.in/_payment'

    @staticmethod
    def prepare_payment_data(user, amount, transaction_id, purpose='Wallet Recharge'):
        """Prepare data for PayU payment"""
        payment_data = {
            'key': settings.PAYU_MERCHANT_KEY,
            'txnid': transaction_id,
            'amount': str(amount),
            'productinfo': purpose,
            'firstname': user.first_name or user.username,
            'email': user.email,
            'phone': user.phone_number,
            'surl': f"{settings.ALLOWED_HOSTS[0]}/api/payments/payu/success/",  # Success URL
            'furl': f"{settings.ALLOWED_HOSTS[0]}/api/payments/payu/failure/",  # Failure URL
        }

        # Generate hash
        payment_data['hash'] = PayUHelper.generate_hash(payment_data)

        return payment_data
