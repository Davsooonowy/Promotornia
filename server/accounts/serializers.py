
from rest_framework import serializers
from django.contrib.auth.models import User
from re import match

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = 'email', 'first_name', 'last_name', 'password'

    def validate_email(self, value):
        return match(r"^.*@(student\.)?\.agh\.edu\.pl$", value)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=f'{validated_data["first_name"]} {validated_data["last_name"]}',
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user