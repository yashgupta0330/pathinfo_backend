/**
 * Email service for job applications
 */

export default () => ({
  async sendApplicationConfirmation(application: any) {
    try {
      const jobTitle = application.job?.title || 'the position';
      const applicantName = `${application.firstName} ${application.lastName}`;
      
      // Send email to applicant
      await strapi.plugins['email'].services.email.send({
        to: application.email,
        from: process.env.SMTP_DEFAULT_FROM || 'noreply@pathinfotech.com',
        replyTo: process.env.HR_EMAIL || 'honeypro420@gmail.com',
        subject: `Application Received - ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Thank You for Your Application!</h2>
            <p>Dear ${applicantName},</p>
            <p>We have received your application for the position of <strong>${jobTitle}</strong>.</p>
            <p>Our team will review your application and get back to you soon.</p>
            <br>
            <p><strong>Application Details:</strong></p>
            <ul>
              <li>Position: ${jobTitle}</li>
              <li>Applied on: ${new Date(application.appliedAt).toLocaleDateString()}</li>
              <li>Status: ${application.applicationStatus}</li>
            </ul>
            <br>
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br>Path Infotech HR Team</p>
          </div>
        `,
      });

      // Send notification to HR
      await strapi.plugins['email'].services.email.send({
        to: process.env.HR_EMAIL || 'honeypro420@gmail.com',
        from: process.env.SMTP_DEFAULT_FROM || 'noreply@pathinfotech.com',
        subject: `New Job Application - ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Job Application Received</h2>
            <p><strong>Position:</strong> ${jobTitle}</p>
            <p><strong>Applicant:</strong> ${applicantName}</p>
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Phone:</strong> ${application.phone}</p>
            ${application.yearsOfExperience ? `<p><strong>Experience:</strong> ${application.yearsOfExperience} years</p>` : ''}
            ${application.currentLocation ? `<p><strong>Location:</strong> ${application.currentLocation}</p>` : ''}
            ${application.expectedSalary ? `<p><strong>Expected Salary:</strong> ${application.expectedSalary} LPA</p>` : ''}
            <br>
            <p><a href="${process.env.STRAPI_ADMIN_URL || 'http://localhost:1337/admin'}/content-manager/collection-types/api::job-application.job-application/${application.id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application in Dashboard</a></p>
          </div>
        `,
      });

      console.log('✅ Application emails sent successfully');
    } catch (error) {
      console.error('❌ Error sending application emails:', error);
      // Don't throw error - we don't want to fail the application if email fails
    }
  },
});
