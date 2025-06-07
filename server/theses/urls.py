from django.urls import path

from . import views

urlpatterns = [
    path('thesis/list/', views.ThesisListView.as_view(), name='thesis-list'),
    path('thesis/', views.ThesisView.as_view(), name='thesis'),
    path('thesis/<int:thesis_id>/', views.ThesisView.as_view(), name='thesis-detail'),
    path('supervisors/list/', views.SupervisorListView.as_view(), name='supervisors-list'),
    path('all_supervisor_interest_tags/', views.TagListView.as_view(), name='all_supervisor_interest_tags'),
    path('supervisor/tags/', views.TagView.as_view(), name='supervisor_tags'),
    path('thesis/supervisor/<int:supervisor_id>/', views.SupervisorThesesView.as_view(), name='supervisor-theses'),
    path('supervisors/<int:supervisor_id>/', views.SupervisorDetailView.as_view(), name='supervisor-detail'),
    path('thesis/new/', views.CreateThesisView.as_view(), name='thesis-nes'),
    path('theses/<int:thesis_id>/edit/', views.ThesisView.as_view(), name='thesis-edit'),
    path('theses/<int:thesis_id>/status/edit/', views.ThesisStatus.as_view(), name='thesis-status-edit'),
    path('thesis/producer/<int:producer_id>/', views.ThesisByProducerView.as_view(), name='thesis-by-producer'),
]