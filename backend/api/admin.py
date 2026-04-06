from django.contrib import admin
from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'price_per_night', 'owner', 'created_at')
    list_filter = ('city',)
    search_fields = ('title', 'city')
