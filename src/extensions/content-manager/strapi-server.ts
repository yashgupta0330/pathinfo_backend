export default (plugin) => {
  // Override the find method for job-application content type
  const originalFind = plugin.controllers['collection-types'].find;
  
  plugin.controllers['collection-types'].find = async (ctx) => {
    const { model } = ctx.params;
    const { _q } = ctx.request.query;
    
    // Only customize for job-application model
    if (model === 'api::job-application.job-application' && _q) {
      try {
        // Get the search query
        const searchQuery = _q;
        
        // Check if it's a numeric search (for years of experience)
        const isNumeric = !isNaN(Number(searchQuery));
        
        // Build custom filters that include job title search and department
        const customFilters: any = {
          $or: [
            // Search in direct fields (applicant information)
            { firstName: { $containsi: searchQuery } },
            { lastName: { $containsi: searchQuery } },
            { email: { $containsi: searchQuery } },
            { phone: { $containsi: searchQuery } },
            { currentLocation: { $containsi: searchQuery } },
            { applicationStatus: { $containsi: searchQuery } },
            { noticePeriod: { $containsi: searchQuery } },
            { skills: { $containsi: searchQuery } },
            
            // Search in related job fields
            {
              job: {
                title: { $containsi: searchQuery }
              }
            },
            // Department search - supports all departments:
            // Engineering, Marketing, Sales, HR, Finance, Operations, Design, Product, Customer Support
            {
              job: {
                department: { $containsi: searchQuery }
              }
            },
            {
              job: {
                role: { $containsi: searchQuery }
              }
            },
            {
              job: {
                location: { $containsi: searchQuery }
              }
            },
            {
              job: {
                jobType: { $containsi: searchQuery }
              }
            },
            {
              job: {
                experienceLevel: { $containsi: searchQuery }
              }
            }
          ]
        };
        
        // If numeric, also search by years of experience
        if (isNumeric) {
          customFilters.$or.push({
            yearsOfExperience: { $eq: Number(searchQuery) }
          });
        }
        
        // Get pagination and sort from query
        const { page = 1, pageSize = 10, sort } = ctx.request.query;
        
        // Fetch entities with custom filters
        const entities = await strapi.entityService.findMany(
          'api::job-application.job-application',
          {
            filters: customFilters,
            populate: ['job', 'resume'],
            sort: sort || { appliedAt: 'desc' },
            pagination: {
              page: Number(page),
              pageSize: Number(pageSize)
            }
          }
        );
        
        // Count total matching entities
        const total = await strapi.db.query('api::job-application.job-application').count({
          where: customFilters
        });
        
        // Return formatted response
        return {
          results: entities,
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            pageCount: Math.ceil(total / Number(pageSize)),
            total
          }
        };
      } catch (error) {
        console.error('Error in custom job-application search:', error);
        // Fallback to original method if error occurs
        return originalFind(ctx);
      }
    }
    
    // For other models, use the original method
    return originalFind(ctx);
  };
  
  return plugin;
};
