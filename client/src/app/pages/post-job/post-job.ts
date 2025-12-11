// src/app/features/employer/post-job/post-job.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface JobFormData {
  // Basic Information
  jobTitle: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  department: string;
  numberOfOpenings: number;

  // Job Description
  jobSummary: string;
  jobDescription: string;
  responsibilities: string[];
  requirements: string[];

  // Qualifications
  educationLevel: string;
  experienceLevel: string;
  yearsOfExperience: number;
  requiredSkills: string[];
  preferredSkills: string[];

  // Compensation
  showSalary: boolean;
  salaryType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  benefits: string[];
  hasEquity: boolean;

  // Application Settings
  applicationDeadline: string | null;
  applicationMethod: string;
  externalUrl: string | null;
  screeningQuestions: string[];
  visaSponsorship: boolean;
  travelRequirement: string;
}

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-job.html',
  styleUrl: './post-job.css',
})
export class PostJob implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentStep = 1;
  totalSteps = 6;
  isLoading = false;
  showPreview = false;

  // Dropdown options
  employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' },
  ];

  workplaceTypes = [
    { value: 'on-site', label: 'On-site' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  departments = [
    { value: 'engineering', label: 'Engineering & IT' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'product', label: 'Product Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'finance', label: 'Finance & Accounting' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'customer-success', label: 'Customer Success' },
    { value: 'legal', label: 'Legal' },
    { value: 'other', label: 'Other' },
  ];

  educationLevels = [
    { value: 'high-school', label: 'High School' },
    { value: 'associate', label: 'Associate Degree' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'phd', label: 'PhD' },
    { value: 'none', label: 'No Degree Required' },
  ];

  experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' },
  ];

  salaryTypes = [
    { value: 'annual', label: 'Annual' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'hourly', label: 'Hourly' },
  ];

  currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD ($)' },
    { value: 'AUD', label: 'AUD ($)' },
    { value: 'INR', label: 'INR (₹)' },
  ];

  benefitOptions = [
    { value: 'health-insurance', label: 'Health Insurance' },
    { value: 'dental', label: 'Dental Insurance' },
    { value: 'vision', label: 'Vision Insurance' },
    { value: '401k', label: '401(k) / Retirement Plan' },
    { value: 'pto', label: 'Paid Time Off' },
    { value: 'sick-leave', label: 'Sick Leave' },
    { value: 'parental-leave', label: 'Parental Leave' },
    { value: 'remote-work', label: 'Remote Work Options' },
    { value: 'flexible-hours', label: 'Flexible Hours' },
    { value: 'gym', label: 'Gym Membership' },
    { value: 'learning', label: 'Learning & Development Budget' },
    { value: 'commuter', label: 'Commuter Benefits' },
    { value: 'meals', label: 'Free Meals/Snacks' },
    { value: 'relocation', label: 'Relocation Assistance' },
  ];

  applicationMethods = [
    { value: 'platform', label: 'Apply through our platform' },
    { value: 'external', label: 'External application URL' },
  ];

  travelRequirements = [
    { value: 'none', label: 'None' },
    { value: 'occasional', label: 'Occasional (< 25%)' },
    { value: 'frequent', label: 'Frequent (25-50%)' },
    { value: 'extensive', label: 'Extensive (> 50%)' },
  ];

  jobForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.jobForm = this.fb.group({
      // Step 1: Basic Information
      basicInfo: this.fb.group({
        jobTitle: ['', [Validators.required, Validators.minLength(5)]],
        employmentType: ['', Validators.required],
        workplaceType: ['', Validators.required],
        location: ['', Validators.required],
        department: ['', Validators.required],
        numberOfOpenings: [1, [Validators.required, Validators.min(1)]],
      }),

      // Step 2: Job Description
      description: this.fb.group({
        jobSummary: [
          '',
          [Validators.required, Validators.minLength(50), Validators.maxLength(500)],
        ],
        jobDescription: ['', [Validators.required, Validators.minLength(100)]],
        responsibilities: this.fb.array([this.createResponsibilityField()]),
        requirements: this.fb.array([this.createRequirementField()]),
      }),

      // Step 3: Qualifications & Skills
      qualifications: this.fb.group({
        educationLevel: ['bachelor', Validators.required],
        experienceLevel: ['mid', Validators.required],
        yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
        requiredSkills: this.fb.array([]),
        preferredSkills: this.fb.array([]),
      }),

      // Step 4: Compensation & Benefits
      compensation: this.fb.group({
        showSalary: [true],
        salaryType: ['annual', Validators.required],
        salaryMin: [null],
        salaryMax: [null],
        currency: ['USD', Validators.required],
        benefits: this.fb.array([]),
        hasEquity: [false],
      }),

      // Step 5: Application Settings
      applicationSettings: this.fb.group({
        applicationDeadline: [null],
        applicationMethod: ['platform', Validators.required],
        externalUrl: [null],
        screeningQuestions: this.fb.array([]),
        visaSponsorship: [false],
        travelRequirement: ['none', Validators.required],
      }),
    });

    // Watch for changes in workplace type to handle location requirement
    this.jobForm.get('basicInfo.workplaceType')?.valueChanges.subscribe((value) => {
      const locationControl = this.jobForm.get('basicInfo.location');
      if (value === 'remote') {
        locationControl?.clearValidators();
        locationControl?.setValue('Remote');
      } else {
        locationControl?.setValidators([Validators.required]);
      }
      locationControl?.updateValueAndValidity();
    });

    // Watch for application method changes
    this.jobForm.get('applicationSettings.applicationMethod')?.valueChanges.subscribe((value) => {
      const urlControl = this.jobForm.get('applicationSettings.externalUrl');
      if (value === 'external') {
        urlControl?.setValidators([Validators.required, Validators.pattern('https?://.+')]);
      } else {
        urlControl?.clearValidators();
      }
      urlControl?.updateValueAndValidity();
    });
  }

  // Form Array Helpers
  createResponsibilityField(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
    });
  }

  createRequirementField(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
    });
  }

  createSkillField(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
    });
  }

  createScreeningQuestionField(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
    });
  }

  // Getters for Form Arrays
  get responsibilities(): FormArray {
    return this.jobForm.get('description.responsibilities') as FormArray;
  }

  get requirements(): FormArray {
    return this.jobForm.get('description.requirements') as FormArray;
  }

  get requiredSkills(): FormArray {
    return this.jobForm.get('qualifications.requiredSkills') as FormArray;
  }

  get preferredSkills(): FormArray {
    return this.jobForm.get('qualifications.preferredSkills') as FormArray;
  }

  get benefits(): FormArray {
    return this.jobForm.get('compensation.benefits') as FormArray;
  }

  get screeningQuestions(): FormArray {
    return this.jobForm.get('applicationSettings.screeningQuestions') as FormArray;
  }

  // Add/Remove Methods
  addResponsibility() {
    this.responsibilities.push(this.createResponsibilityField());
  }

  removeResponsibility(index: number) {
    if (this.responsibilities.length > 1) {
      this.responsibilities.removeAt(index);
    }
  }

  addRequirement() {
    this.requirements.push(this.createRequirementField());
  }

  removeRequirement(index: number) {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  addRequiredSkill() {
    this.requiredSkills.push(this.createSkillField());
  }

  removeRequiredSkill(index: number) {
    this.requiredSkills.removeAt(index);
  }

  addPreferredSkill() {
    this.preferredSkills.push(this.createSkillField());
  }

  removePreferredSkill(index: number) {
    this.preferredSkills.removeAt(index);
  }

  addScreeningQuestion() {
    this.screeningQuestions.push(this.createScreeningQuestionField());
  }

  removeScreeningQuestion(index: number) {
    this.screeningQuestions.removeAt(index);
  }

  onBenefitChange(benefit: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.benefits.push(this.fb.control(benefit));
    } else {
      const index = this.benefits.controls.findIndex((x) => x.value === benefit);
      if (index >= 0) {
        this.benefits.removeAt(index);
      }
    }
  }

  isBenefitSelected(benefit: string): boolean {
    return this.benefits.controls.some((x) => x.value === benefit);
  }

  // Navigation
  nextStep() {
    debugger;
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    } else {
      this.markStepAsTouched();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.validateStepsUpTo(step - 1)) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    const stepGroups: { [key: number]: string } = {
      1: 'basicInfo',
      2: 'description',
      3: 'qualifications',
      4: 'compensation',
      5: 'applicationSettings',
    };

    const groupName = stepGroups[this.currentStep];
    if (groupName) {
      const group = this.jobForm.get(groupName);
      console.log(group?.valid)
      return group?.valid || false;
    }
    return true;
  }

  validateStepsUpTo(step: number): boolean {
    for (let i = 1; i <= step; i++) {
      if (!this.validateStep(i)) {
        return false;
      }
    }
    return true;
  }

  validateStep(step: number): boolean {
    const stepGroups: { [key: number]: string } = {
      1: 'basicInfo',
      2: 'description',
      3: 'qualifications',
      4: 'compensation',
      5: 'applicationSettings',
    };

    const groupName = stepGroups[step];
    if (groupName) {
      const group = this.jobForm.get(groupName);
      return group?.valid || false;
    }
    return true;
  }

  markStepAsTouched() {
    const stepGroups: { [key: number]: string } = {
      1: 'basicInfo',
      2: 'description',
      3: 'qualifications',
      4: 'compensation',
      5: 'applicationSettings',
    };

    const groupName = stepGroups[this.currentStep];
    if (groupName) {
      const group = this.jobForm.get(groupName) as FormGroup;
      Object.keys(group.controls).forEach((key) => {
        const control = group.get(key);
        control?.markAsTouched();
        if (control instanceof FormArray) {
          control.controls.forEach((c) => c.markAsTouched());
        }
      });
    }
  }

  // Preview
  showPreviewModal() {
    if (this.jobForm.valid) {
      this.showPreview = true;
    } else {
      this.jobForm.markAllAsTouched();
    }
  }

  closePreview() {
    this.showPreview = false;
  }

  // Submit
  onSubmit(isDraft: boolean = false) {
    if (!this.jobForm.valid && !isDraft) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData = this.prepareFormData(isDraft);
    console.log('Job posting data:', formData);

    // TODO: Call API to save job posting
    // this.jobService.createJob(formData).subscribe(...)

    setTimeout(() => {
      this.isLoading = false;
      if (isDraft) {
        alert('Job saved as draft!');
      } else {
        alert('Job posted successfully!');
        this.router.navigate(['/employer/my-jobs']);
      }
    }, 1500);
  }

  prepareFormData(isDraft: boolean) {
    return {
      ...this.jobForm.value,
      status: isDraft ? 'draft' : 'active',
      responsibilities: this.responsibilities.value.map((r: any) => r.text),
      requirements: this.requirements.value.map((r: any) => r.text),
      requiredSkills: this.requiredSkills.value.map((s: any) => s.name),
      preferredSkills: this.preferredSkills.value.map((s: any) => s.name),
      screeningQuestions: this.screeningQuestions.value.map((q: any) => q.question),
    };
  }

  getStepStatus(step: number): 'completed' | 'current' | 'upcoming' {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'current';
    return 'upcoming';
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getEmploymentTypeLabel(value: string): string {
    return this.employmentTypes.find((t) => t.value === value)?.label || value;
  }

  getDepartmentLabel(value: string): string {
    return this.departments.find((d) => d.value === value)?.label || value;
  }

  getEducationLabel(value: string): string {
    return this.educationLevels.find((e) => e.value === value)?.label || value;
  }

  getExperienceLabel(value: string): string {
    return this.experienceLevels.find((e) => e.value === value)?.label || value;
  }

  getBenefitLabel(value: string): string {
    return this.benefitOptions.find((b) => b.value === value)?.label || value;
  }

  getTravelLabel(value: string): string {
    return this.travelRequirements.find((t) => t.value === value)?.label || value;
  }

  formatSalaryRange(): string {
    const min = this.jobForm.get('compensation.salaryMin')?.value;
    const max = this.jobForm.get('compensation.salaryMax')?.value;
    const currency = this.jobForm.get('compensation.currency')?.value;
    const type = this.jobForm.get('compensation.salaryType')?.value;

    const currencySymbol = this.getCurrencySymbol(currency);
    const typeLabel = type === 'hourly' ? '/hr' : type === 'monthly' ? '/mo' : '/yr';

    if (min && max) {
      return `${currencySymbol}${this.formatNumber(min)} - ${currencySymbol}${this.formatNumber(
        max
      )}${typeLabel}`;
    } else if (min) {
      return `From ${currencySymbol}${this.formatNumber(min)}${typeLabel}`;
    } else if (max) {
      return `Up to ${currencySymbol}${this.formatNumber(max)}${typeLabel}`;
    }
    return 'Competitive';
  }

  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: '$',
      AUD: '$',
      INR: '₹',
    };
    return symbols[currency] || currency;
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
