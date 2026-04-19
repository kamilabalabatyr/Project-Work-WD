from django.urls import path
from . import views

urlpatterns = [
    # Auth (FBV)
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),

    # Properties (CBV)
    path('properties/', views.PropertyListCreateView.as_view(), name='property-list'),
    path('properties/<int:pk>/', views.PropertyDetailView.as_view(), name='property-detail'),

    # Admin — approval workflow (FBV)
    path('admin/properties/pending/', views.pending_properties_view, name='pending-properties'),
    path('admin/properties/<int:pk>/approval/', views.property_approval_view, name='property-approval'),

    # Landlord extranet (FBV)
    path('landlord/properties/', views.landlord_properties_view, name='landlord-properties'),
    path('landlord/properties/<int:pk>/bookings/', views.landlord_property_bookings_view, name='landlord-property-bookings'),
    path('landlord/bookings/', views.landlord_all_bookings_view, name='landlord-all-bookings'),

    # Bookings (CBV)
    path('bookings/', views.BookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),

    # Payment emulation
    path('payments/', views.payment_view, name='payment'),
]
