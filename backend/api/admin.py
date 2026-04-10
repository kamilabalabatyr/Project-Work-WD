from django.contrib import admin
from .models import Property, Booking, Review


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'price_per_night', 'owner', 'created_at')
    list_filter = ('city',)
    search_fields = ('title', 'city')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'guest', 'property', 'check_in', 'check_out', 'total_price', 'created_at')
    list_filter = ('check_in', 'check_out')
    search_fields = ('guest__username', 'property__title')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'rating', 'created_at')
    list_filter = ('rating',)
