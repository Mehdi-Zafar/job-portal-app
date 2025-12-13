// src/database/seed.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Create some skills
    console.log('Creating skills...');
    const skillsData = [
      { name: 'JavaScript', category: 'Programming' },
      { name: 'TypeScript', category: 'Programming' },
      { name: 'React', category: 'Frontend' },
      { name: 'Angular', category: 'Frontend' },
      { name: 'Vue.js', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'NestJS', category: 'Backend' },
      { name: 'Python', category: 'Programming' },
      { name: 'Django', category: 'Backend' },
      { name: 'FastAPI', category: 'Backend' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'MongoDB', category: 'Database' },
      { name: 'AWS', category: 'Cloud' },
      { name: 'Docker', category: 'DevOps' },
      { name: 'Kubernetes', category: 'DevOps' },
      { name: 'Git', category: 'Version Control' },
      { name: 'Project Management', category: 'Soft Skills' },
      { name: 'Communication', category: 'Soft Skills' },
      { name: 'Leadership', category: 'Soft Skills' },
      { name: 'Problem Solving', category: 'Soft Skills' },
    ];

    const insertedSkills = await db
      .insert(schema.skills)
      .values(skillsData)
      .returning();
    console.log(`✅ Created ${insertedSkills.length} skills`);

    // 2. Create test users
    console.log('Creating test users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create applicant user
    const [applicantUser] = await db
      .insert(schema.users)
      .values({
        username: 'john_applicant',
        email: 'john.applicant@example.com',
        passwordHash: hashedPassword,
        emailVerified: true,
      })
      .returning();

    await db.insert(schema.userRoles).values({
      userId: applicantUser.id,
      role: 'APPLICANT',
    });

    console.log('✅ Created applicant user');

    // Create employer user
    const [employerUser] = await db
      .insert(schema.users)
      .values({
        username: 'jane_employer',
        email: 'jane.employer@example.com',
        passwordHash: hashedPassword,
        emailVerified: true,
      })
      .returning();

    await db.insert(schema.userRoles).values({
      userId: employerUser.id,
      role: 'EMPLOYER',
    });

    console.log('✅ Created employer user');

    // Create user with both roles
    const [bothRolesUser] = await db
      .insert(schema.users)
      .values({
        username: 'alex_both',
        email: 'alex.both@example.com',
        passwordHash: hashedPassword,
        emailVerified: true,
      })
      .returning();

    await db.insert(schema.userRoles).values([
      { userId: bothRolesUser.id, role: 'APPLICANT' },
      { userId: bothRolesUser.id, role: 'EMPLOYER' },
    ]);

    console.log('✅ Created user with both roles');

    // 3. Create applicant profile
    console.log('Creating applicant profile...');
    const [applicantProfile] = await db
      .insert(schema.applicantProfiles)
      .values({
        userId: applicantUser.id,
        fullName: 'John Doe',
        phone: '+1234567890',
        currentTitle: 'Senior Software Engineer',
        professionalSummary:
          'Experienced software engineer with 8+ years of experience in web development.',
        currentLocation: 'San Francisco, CA',
        experienceLevel: 'SENIOR',
        yearsOfExperience: 8,
        expectedSalaryMin: 120000,
        expectedSalaryMax: 180000,
        isProfileComplete: true,
        completionPercentage: 100,
      })
      .returning();

    // Add skills to applicant
    await db.insert(schema.applicantSkills).values([
      {
        applicantProfileId: applicantProfile.id,
        skillId: insertedSkills[0].id, // JavaScript
        proficiencyLevel: 'EXPERT',
        yearsOfExperience: 8,
      },
      {
        applicantProfileId: applicantProfile.id,
        skillId: insertedSkills[1].id, // TypeScript
        proficiencyLevel: 'ADVANCED',
        yearsOfExperience: 5,
      },
      {
        applicantProfileId: applicantProfile.id,
        skillId: insertedSkills[2].id, // React
        proficiencyLevel: 'EXPERT',
        yearsOfExperience: 6,
      },
    ]);

    console.log('✅ Created applicant profile with skills');

    // 4. Create employer profile
    console.log('Creating employer profile...');
    const [employerProfile] = await db
      .insert(schema.employerProfiles)
      .values({
        userId: employerUser.id,
        companyName: 'TechCorp Inc.',
        companySize: '100-500',
        industry: 'Software Development',
        companyWebsite: 'https://techcorp.example.com',
        companyDescription:
          'Leading software development company specializing in enterprise solutions.',
        contactPersonName: 'Jane Smith',
        contactPersonDesignation: 'HR Manager',
        companyAddress: '123 Tech Street, San Francisco, CA 94105',
        companyPhone: '+1987654321',
        isVerified: true,
        isProfileComplete: true,
        completionPercentage: 100,
      })
      .returning();

    console.log('✅ Created employer profile');

    // 5. Create sample job postings
    console.log('Creating job postings...');
    const [jobPosting] = await db
      .insert(schema.jobPostings)
      .values({
        employerProfileId: employerProfile.id,
        jobTitle: 'Senior Full Stack Developer',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        location: 'San Francisco, CA',
        department: 'engineering',
        numberOfOpenings: 2,
        jobSummary:
          'We are seeking an experienced Full Stack Developer to join our growing engineering team and help build scalable web applications.',
        jobDescription: `We are looking for a talented Senior Full Stack Developer to join our team. You will be responsible for developing and maintaining our web applications, working with modern technologies, and collaborating with cross-functional teams.

The ideal candidate has strong experience with both frontend and backend development, a passion for writing clean code, and excellent problem-solving skills.`,
        responsibilities: [
          'Design and develop scalable web applications',
          'Collaborate with product managers and designers',
          'Write clean, maintainable, and well-tested code',
          'Participate in code reviews and technical discussions',
          'Mentor junior developers',
        ],
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          '5+ years of experience in full stack development',
          'Strong proficiency in JavaScript/TypeScript',
          'Experience with React or Angular',
          'Experience with Node.js and Express/NestJS',
          'Solid understanding of databases (SQL and NoSQL)',
        ],
        educationLevel: 'BACHELOR',
        experienceLevel: 'senior',
        yearsOfExperience: 5,
        showSalary: true,
        salaryType: 'ANNUAL',
        salaryMin: 140000,
        salaryMax: 200000,
        currency: 'USD',
        benefits: [
          'health-insurance',
          'dental',
          'vision',
          '401k',
          'pto',
          'remote-work',
          'flexible-hours',
          'learning',
        ],
        hasEquity: true,
        applicationMethod: 'PLATFORM',
        visaSponsorship: true,
        travelRequirement: 'OCCASIONAL',
        status: 'ACTIVE',
        postedDate: new Date(),
      })
      .returning();

    // Add required skills to job
    await db.insert(schema.jobRequiredSkills).values([
      {
        jobPostingId: jobPosting.id,
        skillId: insertedSkills[0].id, // JavaScript
        isRequired: true,
      },
      {
        jobPostingId: jobPosting.id,
        skillId: insertedSkills[1].id, // TypeScript
        isRequired: true,
      },
      {
        jobPostingId: jobPosting.id,
        skillId: insertedSkills[2].id, // React
        isRequired: true,
      },
      {
        jobPostingId: jobPosting.id,
        skillId: insertedSkills[5].id, // Node.js
        isRequired: true,
      },
      {
        jobPostingId: jobPosting.id,
        skillId: insertedSkills[10].id, // PostgreSQL
        isRequired: false, // Preferred
      },
    ]);

    console.log('✅ Created job posting with required skills');

    // 6. Create a sample application
    console.log('Creating job application...');
    const [application] = await db
      .insert(schema.jobApplications)
      .values({
        jobPostingId: jobPosting.id,
        applicantProfileId: applicantProfile.id,
        coverLetter:
          'I am very interested in this position and believe my experience aligns well with the requirements...',
        status: 'SUBMITTED',
      })
      .returning();

    // Add activity log
    await db.insert(schema.applicationActivities).values({
      applicationId: application.id,
      action: 'application_submitted',
      newStatus: 'SUBMITTED',
      notes: 'Application submitted successfully',
    });

    console.log('✅ Created job application with activity log');

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('Test credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Applicant:');
    console.log('  Email: john.applicant@example.com');
    console.log('  Password: Password123!');
    console.log('');
    console.log('Employer:');
    console.log('  Email: jane.employer@example.com');
    console.log('  Password: Password123!');
    console.log('');
    console.log('Both Roles:');
    console.log('  Email: alex.both@example.com');
    console.log('  Password: Password123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
