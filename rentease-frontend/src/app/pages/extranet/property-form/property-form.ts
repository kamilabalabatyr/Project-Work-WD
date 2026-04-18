import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { PROPERTY_PHOTOS, getPropertyPhotoUrl } from '../../../interfaces/property.interface';

interface PropertyFormData {
  title: string;
  description: string;
  city: string;
  price_per_night: number | null;
  max_guests: number | null;
}

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './property-form.html',
  styleUrl: './property-form.scss',
})
export class PropertyForm implements OnInit {
  isEditMode = signal(false);
  propertyId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMsg = signal('');
  fieldErrors = signal<Record<string, string[]>>({});

  formData = signal<PropertyFormData>({
    title: '',
    description: '',
    city: '',
    price_per_night: null,
    max_guests: null,
  });

  selectedImages = signal<string[]>([]);
  readonly allPhotos = PROPERTY_PHOTOS;
  readonly getPhotoUrl = getPropertyPhotoUrl;

  isImageSelected(filename: string): boolean {
    return this.selectedImages().includes(filename);
  }

  toggleImage(filename: string): void {
    const current = this.selectedImages();
    if (current.includes(filename)) {
      if (current.length > 1) {
        this.selectedImages.set(current.filter(f => f !== filename));
      }
    } else {
      this.selectedImages.set([...current, filename]);
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.propertyId.set(Number(id));
      this.loadProperty(Number(id));
    }
  }

  loadProperty(id: number) {
    this.isLoading.set(true);
    this.propertyService.getById(id).subscribe({
      next: (p) => {
        this.formData.set({
          title: p.title,
          description: p.description,
          city: p.city,
          price_per_night: p.price_per_night,
          max_guests: p.max_guests,
        });
        this.selectedImages.set(p.images?.length ? p.images : ['photo_0.jpg']);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить объявление');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    this.isSaving.set(true);
    this.errorMsg.set('');
    this.fieldErrors.set({});

    const raw = this.formData();
    const id = this.propertyId();

    if (this.selectedImages().length === 0) {
      this.errorMsg.set('Выберите хотя бы одну фотографию');
      this.isSaving.set(false);
      return;
    }

    const data = {
      ...raw,
      price_per_night: raw.price_per_night ?? undefined,
      max_guests: raw.max_guests ?? undefined,
      images: this.selectedImages(),
    };

    const request = id
      ? this.propertyService.update(id, data)
      : this.propertyService.create(data);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/extranet/properties']);
      },
      error: (err) => {
        const errors = err?.error && typeof err.error === 'object' ? err.error : {};
        this.fieldErrors.set(errors);
        this.errorMsg.set(errors['non_field_errors']?.[0] ?? 'Произошла ошибка');
        this.isSaving.set(false);
      }
    });
  }

  getFieldError(field: string): string {
    return this.fieldErrors()[field]?.[0] ?? '';
  }
}
