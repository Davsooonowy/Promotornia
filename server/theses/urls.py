
from django.urls import path

from . import views

urlpatterns = [
    path('thesis/list/', views.ThesisListView.as_view(), name='thesis-list'),
    path('thesis/', views.ThesisView.as_view(), name='thesis'),
    path('thesis/<int:thesis_id>/', views.ThesisView.as_view(), name='thesis-detail'),
    path('supervisors/list/', views.SupervisorListView.as_view(), name='supervisors-list')
]