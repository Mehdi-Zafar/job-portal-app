// src/app/core/models/application.model.ts
export interface Application {
  id: string;
  jobPostingId: string;
  applicantProfileId: string;
  coverLetter?: string;
  resumeUrl?: string;
  screeningAnswers?: string[];
  status: string;
  appliedAt: string;
  updatedAt: string;
  jobPosting?: {
    id: string;
    jobTitle: string;
    employmentType: string;
    location: string;
    employerProfile: {
      companyName: string;
      companyLogoUrl?: string;
    };
  };
  applicantProfile?: any;
  activities?: ApplicationActivity[];
}

export interface ApplicationActivity {
  id: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  notes?: string;
  createdAt: string;
  performedByUserId?: string;
}

export interface CreateApplicationRequest {
  jobPostingId: string;
  coverLetter?: string;
  resumeUrl?: string;
  screeningAnswers?: string[];
}

export interface UpdateApplicationStatusRequest {
  status: string;
  notes?: string;
}