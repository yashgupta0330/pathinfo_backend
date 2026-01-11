/**
 * job controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::job.job', ({ strapi }) => ({
  // Get all active jobs
  async find(ctx) {
    const { query } = ctx;
    
    // Add default filters for active and published jobs
    const filters = {
      ...(query.filters as object || {}),
      isActive: true,
    };

    // Sort by posted date (newest first) by default
    const sort = query.sort || { postedDate: 'desc' };

    const entities = await strapi.entityService.findMany('api::job.job', {
      filters,
      sort,
      populate: ['job_applications'],
      ...(query.pagination && { pagination: query.pagination }),
    });

    const sanitizedResults = await this.sanitizeOutput(entities, ctx);
    
    return this.transformResponse(sanitizedResults);
  },

  // Get single job by slug
  async findOne(ctx) {
    const { id } = ctx.params;
    
    // Check if id is actually a slug
    let entity;
    if (isNaN(Number(id))) {
      // It's a slug
      const entities = await strapi.entityService.findMany('api::job.job', {
        filters: { slug: id },
        populate: ['job_applications'],
      });
      entity = entities[0];
    } else {
      // It's an ID
      entity = await strapi.entityService.findOne('api::job.job', id, {
        populate: ['job_applications'],
      });
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    
    return this.transformResponse(sanitizedEntity);
  },
}));
