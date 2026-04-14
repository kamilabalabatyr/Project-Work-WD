from django.contrib import admin
from .models import Property, Booking, Review, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username',)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'price_per_night', 'owner', 'status', 'created_at')
    list_filter = ('status', 'city')
    search_fields = ('title', 'city')
    list_editable = ('status',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'guest', 'property', 'check_in', 'check_out', 'total_price', 'created_at')
    list_filter = ('check_in', 'check_out')
    search_fields = ('guest__username', 'property__title')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'rating', 'created_at')
    list_filter = ('rating',)
