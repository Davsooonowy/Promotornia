from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('dean/new_users/', views.DeanView.as_view(), name='dean_create'),
    path('dean/users/', views.DeanView.as_view(), name='dean_delete'),
    path('user/login/', TokenObtainPairView.as_view(), name='login'),
    path('user/login/refresh/', TokenRefreshView.as_view(), name='refresh'),
]