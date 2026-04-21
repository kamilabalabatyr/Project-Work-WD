from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


class RegisterViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('register')

    def test_guest_registration_returns_token(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPass123',
            'password2': 'StrongPass123',
            'role': 'guest',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['role'], 'guest')

    def test_duplicate_username_returns_400(self):
        data = {
            'username': 'sameuser',
            'email': 'a@example.com',
            'password': 'StrongPass123',
            'password2': 'StrongPass123',
        }
        self.client.post(self.url, data)
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_mismatch_returns_400(self):
        response = self.client.post(self.url, {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPass123',
            'password2': 'WrongPass999',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
