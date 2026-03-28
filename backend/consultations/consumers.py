import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Consultation, ChatMessage
from users.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat"""

    async def connect(self):
        self.consultation_id = self.scope['url_route']['kwargs']['consultation_id']
        self.room_group_name = f'chat_{self.consultation_id}'
        self.user = self.scope['user']

        # Verify user has access to this consultation
        has_access = await self.check_consultation_access()

        if not has_access:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send recent messages
        messages = await self.get_recent_messages()
        await self.send(text_data=json.dumps({
            'type': 'message_history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Receive message from WebSocket"""
        data = json.loads(text_data)
        message_type = data.get('type', 'text')
        message = data.get('message', '')

        if not message:
            return

        # Save message to database
        saved_message = await self.save_message(message, message_type)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': saved_message['id'],
                    'sender_id': saved_message['sender_id'],
                    'sender_name': saved_message['sender_name'],
                    'message_type': saved_message['message_type'],
                    'content': saved_message['content'],
                    'created_at': saved_message['created_at'],
                }
            }
        )

    async def chat_message(self, event):
        """Receive message from room group"""
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    @database_sync_to_async
    def check_consultation_access(self):
        """Check if user has access to this consultation"""
        try:
            consultation = Consultation.objects.get(id=self.consultation_id)
            return (
                self.user.id == consultation.user.id or
                self.user.id == consultation.astrologer.user.id
            )
        except Consultation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, message_type='text'):
        """Save message to database"""
        consultation = Consultation.objects.get(id=self.consultation_id)

        message = ChatMessage.objects.create(
            consultation=consultation,
            sender=self.user,
            message_type=message_type,
            content=content
        )

        return {
            'id': message.id,
            'sender_id': self.user.id,
            'sender_name': self.user.get_full_name() or self.user.username,
            'message_type': message.message_type,
            'content': message.content,
            'created_at': message.created_at.isoformat(),
        }

    @database_sync_to_async
    def get_recent_messages(self):
        """Get recent messages for this consultation"""
        consultation = Consultation.objects.get(id=self.consultation_id)
        messages = consultation.messages.all().order_by('created_at')[:100]

        return [
            {
                'id': msg.id,
                'sender_id': msg.sender.id,
                'sender_name': msg.sender.get_full_name() or msg.sender.username,
                'message_type': msg.message_type,
                'content': msg.content,
                'created_at': msg.created_at.isoformat(),
            }
            for msg in messages
        ]
