/**
 * Custom routes for job-application
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/job-applications/job/:jobId',
      handler: 'job-application.findByJob',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/job-applications/department/:department',
      handler: 'job-application.findByDepartment',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/job-applications/role/:role',
      handler: 'job-application.findByRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/job-applications/location/:location',
      handler: 'job-application.findByLocation',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
