from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('dean/users/', views.DeanView.as_view(), name='dean_delete'),
    path('user/login/', views.LoginView.as_view(), name='login'),
    path('user/login/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path("auth/view-password/", views.OneTimePasswordView.as_view(), name="view_password")
]