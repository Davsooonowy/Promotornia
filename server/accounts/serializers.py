
from rest_framework import serializers
import re
from .models import SystemUser

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = SystemUser
        fields = ('email', 'first_name', 'last_name', 'password',
                  'is_student', 'is_supervisor', 'is_dean')

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if email is None:
            raise serializers.ValidationError('Email field is required')
        if password is None:
            raise serializers.ValidationError('Password field is required')
        if re.match(r"^.*@(student\.)?agh\.edu\.pl$", email) is None:
            raise serializers.ValidationError('Invalid email')

        is_student = data.get('is_student')
        is_supervisor = data.get('is_supervisor')
        is_dean = data.get('is_dean')

        if [is_student, is_supervisor, is_dean].count(True) != 1:
            raise serializers.ValidationError('Expected exactly one of is_student, is_supervisor, is_dean to be True')

        return data

    def create(self, validated_data):
        user = SystemUser.objects.create_user(**validated_data)
        return user
