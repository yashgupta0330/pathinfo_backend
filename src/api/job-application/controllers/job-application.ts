/**
 * job-application controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::job-application.job-application', ({ strapi }) => ({
  // Get all job applications with filtering
  async find(ctx) {
    const { query } = ctx;
    
    // Build filters
    const filters: any = { ...(query.filters as object || {}) };

    const entities = await strapi.entityService.findMany('api::job-application.job-application', {
      filters,
      sort: query.sort || { appliedAt: 'desc' },
      populate: ['job', 'resume'],
      ...(query.pagination && { pagination: query.pagination }),
    });

    const sanitizedResults = await this.sanitizeOutput(entities, ctx);
    
    return this.transformResponse(sanitizedResults);
  },

  // Get single job application
  async findOne(ctx) {
    const { id } = ctx.params;
    
    const entity = await strapi.entityService.findOne('api::job-application.job-application', id, {
      populate: {
        job: true,
        resume: true,
      },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    
    return this.transformResponse(sanitizedEntity);
  },

  // Create job application
  async create(ctx) {
    try {
      const { data, files } = ctx.request.body;
      
      // Parse and prepare application data
      const applicationData: any = {
        firstName: data?.firstName || ctx.request.body.firstName,
        lastName: data?.lastName || ctx.request.body.lastName,
        email: data?.email || ctx.request.body.email,
        phone: data?.phone || ctx.request.body.phone,
        job: parseInt(data?.job || ctx.request.body.job),
        appliedAt: new Date().toISOString(),
        applicationStatus: 'Submitted',
      };

      // Add optional fields if present
      if (data?.coverLetter || ctx.request.body.coverLetter) {
        applicationData.coverLetter = data?.coverLetter || ctx.request.body.coverLetter;
      }
      if (data?.linkedinUrl || ctx.request.body.linkedinUrl) {
        applicationData.linkedinUrl = data?.linkedinUrl || ctx.request.body.linkedinUrl;
      }
      if (data?.portfolioUrl || ctx.request.body.portfolioUrl) {
        applicationData.portfolioUrl = data?.portfolioUrl || ctx.request.body.portfolioUrl;
      }
      if (data?.yearsOfExperience || ctx.request.body.yearsOfExperience) {
        applicationData.yearsOfExperience = parseInt(data?.yearsOfExperience || ctx.request.body.yearsOfExperience);
      }
      if (data?.currentLocation || ctx.request.body.currentLocation) {
        applicationData.currentLocation = data?.currentLocation || ctx.request.body.currentLocation;
      }
      if (data?.expectedSalary || ctx.request.body.expectedSalary) {
        applicationData.expectedSalary = parseFloat(data?.expectedSalary || ctx.request.body.expectedSalary);
      }
      if (data?.noticePeriod || ctx.request.body.noticePeriod) {
        applicationData.noticePeriod = data?.noticePeriod || ctx.request.body.noticePeriod;
      }
      if (data?.skills || ctx.request.body.skills) {
        applicationData.skills = data?.skills || ctx.request.body.skills;
      }


      // Prepare files object for Strapi
      const filesData: any = {};
      
      // Try different possible file keys
      if (ctx.request.files) {
        if (ctx.request.files['files.resume']) {
          filesData.resume = ctx.request.files['files.resume'];
        } else if (ctx.request.files['resume']) {
          filesData.resume = ctx.request.files['resume'];
        } else if (ctx.request.files['files[resume]']) {
          filesData.resume = ctx.request.files['files[resume]'];
        }
      }

      // Create the application first without files
      let entity = await strapi.entityService.create('api::job-application.job-application', {
        data: applicationData,
        populate: ['job', 'resume'],
      });

      // If resume file exists, upload and link it
      if (filesData.resume) {
        try {
          await strapi.plugins.upload.services.upload.upload({
            data: {
              refId: entity.id,
              ref: 'api::job-application.job-application',
              field: 'resume',
            },
            files: filesData.resume,
          });
          // Fetch the updated entity with the resume
          entity = await strapi.entityService.findOne('api::job-application.job-application', entity.id, {
            populate: ['job', 'resume'],
          });
        } catch (uploadError) {
          // Optionally log error in production
        }
      }

      // Get job details safely
      const jobTitle = (entity as any).job?.title || 'Position';
      const jobDepartment = (entity as any).job?.department || 'N/A';
      const jobLocation = (entity as any).job?.location || 'N/A';

      // Send confirmation emails
      try {
        const emailService = strapi.plugin('email')?.service('email');
        if (emailService) {
          // Send to applicant
          await emailService.send({
            to: entity.email,
            from: process.env.EMAIL_FROM || 'honeypro420@gmail.com',
            subject: `Application Received - ${jobTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3b82f6;">Thank You for Your Application!</h2>
                <p>Dear ${entity.firstName} ${entity.lastName},</p>
                <p>We have received your application for the position of <strong>${jobTitle}</strong>.</p>
                <p>Our team will review your application and get back to you soon.</p>
                <br>
                <p><strong>Application Details:</strong></p>
                <ul>
                  <li><strong>Position:</strong> ${jobTitle}</li>
                  <li><strong>Applied on:</strong> ${new Date(entity.appliedAt).toLocaleDateString()}</li>
                  <li><strong>Status:</strong> ${entity.applicationStatus}</li>
                </ul>
                <br>
                <p>If you have any questions, feel free to reach out to us.</p>
                <p>Best regards,<br><strong>Path Infotech HR Team</strong></p>
              </div>
            `,
          });
          
          // Notify HR/Admin
          await emailService.send({
            to: process.env.ADMIN_EMAIL || 'honeypro420@gmail.com',
            from: process.env.EMAIL_FROM || 'honeypro420@gmail.com',
            replyTo: entity.email,
            subject: `New Job Application - ${jobTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3b82f6;">🎯 New Job Application Received</h2>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                
                <h3 style="color: #1f2937;">Position Details:</h3>
                <p><strong>Job Title:</strong> ${jobTitle}</p>
                <p><strong>Department:</strong> ${jobDepartment}</p>
                <p><strong>Location:</strong> ${jobLocation}</p>
                
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                
                <h3 style="color: #1f2937;">Candidate Information:</h3>
                <p><strong>Name:</strong> ${entity.firstName} ${entity.lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${entity.email}">${entity.email}</a></p>
                <p><strong>Phone:</strong> ${entity.phone}</p>
                
                ${entity.yearsOfExperience ? `<p><strong>Experience:</strong> ${entity.yearsOfExperience} years</p>` : ''}
                ${entity.currentLocation ? `<p><strong>Current Location:</strong> ${entity.currentLocation}</p>` : ''}
                ${entity.expectedSalary ? `<p><strong>Expected Salary:</strong> ₹${entity.expectedSalary} LPA</p>` : ''}
                ${entity.noticePeriod ? `<p><strong>Notice Period:</strong> ${entity.noticePeriod}</p>` : ''}
                
                ${entity.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${entity.linkedinUrl}" target="_blank">View Profile</a></p>` : ''}
                ${entity.portfolioUrl ? `<p><strong>Portfolio:</strong> <a href="${entity.portfolioUrl}" target="_blank">View Portfolio</a></p>` : ''}
                
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                
                <p style="text-align: center;">
                  <a href="http://localhost:1337/admin/content-manager/collection-types/api::job-application.job-application/${entity.id}" 
                     style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
                    📋 View Full Application in Dashboard
                  </a>
                </p>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
                  Applied on: ${new Date(entity.appliedAt).toLocaleString()}
                </p>
              </div>
            `,
          });
          
          console.log('✅ Confirmation emails sent to applicant and HR');
        } else {
          console.log('⚠️ Email plugin not configured');
        }
      } catch (emailError) {
        console.error('❌ Email sending failed (but application created):', emailError);
      }

      // Debug: Log skills field
      console.log('🟢 Job Application Submitted. Skills:', applicationData.skills, '| Raw:', data?.skills || ctx.request.body.skills);

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  },

  // Update application status (for HR)
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    const entity = await strapi.entityService.update('api::job-application.job-application', id, {
      data,
      populate: {
        job: true,
        resume: true,
      },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    
    return this.transformResponse(sanitizedEntity);
  },

  // Get applications by job ID
  async findByJob(ctx) {
    const { jobId } = ctx.params;
    
    const entities = await strapi.entityService.findMany('api::job-application.job-application', {
      filters: {
        job: {
          id: jobId,
        },
      },
      sort: { appliedAt: 'desc' },
      populate: {
        job: true,
        resume: true,
      },
    });

    const sanitizedResults = await this.sanitizeOutput(entities, ctx);
    
    return this.transformResponse(sanitizedResults);
  },

  // Get applications filtered by department
  async findByDepartment(ctx) {
    const { department } = ctx.params;
    
    const entities = await strapi.entityService.findMany('api::job-application.job-application', {
      filters: {
        job: {
          department,
        },
      },
      sort: { appliedAt: 'desc' },
      populate: {
        job: true,
        resume: true,
      },
    });

    const sanitizedResults = await this.sanitizeOutput(entities, ctx);
    
    return this.transformResponse(sanitizedResults);
  },

  // Get applications filtered by role
  async findByRole(ctx) {
    const { role } = ctx.params;
    
    const entities = await strapi.entityService.findMany('api::job-application.job-application', {
      filters: {
        job: {
          role,
        },
      },
      sort: { appliedAt: 'desc' },
      populate: {
        job: true,
        resume: true,
      },
    });

    const sanitizedResults = await this.sanitizeOutput(entities, ctx);
    
    return this.transformResponse(sanitizedResults);
  },

  // Get applications filtered by location
  async findByLocation(ctx) {
    const { location } = ctx.params;
    
    const entities = await strapi.entityService.findMany('api::job-application.job-application', {
      filters: {
        job: {
          location: {
            $containsi: location,
          },
        },
      },
      sort: { appliedAt: 'desc' },
      populate: {
        job: true,
        resume: true,
      },
    });

    const sanitizedResults = await this.sanitizeOutput(entities, ctx);
    
    return this.transformResponse(sanitizedResults);
  },
}));
