from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation, ConsultationFeedback
from astrologers.models import AstrologerReview


@receiver(post_save, sender=ConsultationFeedback)
def create_astrologer_review(sender, instance, created, **kwargs):
    """Automatically create astrologer review from consultation feedback"""
    if created:
        # Create or update astrologer review
        AstrologerReview.objects.update_or_create(
            astrologer=instance.consultation.astrologer,
            user=instance.user,
            consultation=instance.consultation,
            defaults={
                'rating': instance.rating,
                'review_text': instance.feedback_text
            }
        )

        # Update astrologer's average rating
        astrologer = instance.consultation.astrologer
        reviews = AstrologerReview.objects.filter(astrologer=astrologer, is_approved=True)
        total_reviews = reviews.count()

        if total_reviews > 0:
            avg_rating = sum(r.rating for r in reviews) / total_reviews
            astrologer.average_rating = round(avg_rating, 2)
            astrologer.total_reviews = total_reviews
            astrologer.save(update_fields=['average_rating', 'total_reviews'])
