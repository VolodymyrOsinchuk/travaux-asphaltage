// services/api.js - API client pour les services
import customFetch from '../utils/customFetch' // Assuming customFetch is in a separate file or defined above
import { toast } from 'react-toastify' // Make sure you have react-toastify installed and configured

export class ServicesAPI {
  // No need for baseURL here, as it's configured in customFetch

  static async getAllServices(params = {}) {
    try {
      // Axios handles query parameters via the 'params' object
      const response = await customFetch.get('/services', { params })
      return response.data // Axios puts the parsed JSON in .data
    } catch (error) {
      // Improved error message to include status code if available
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.msg ||
            error.response.statusText ||
            'An unknown error occurred.'
          }`
        : error.message || 'Failed to connect to the server or fetch services.'
      toast.error(errorMessage)
      throw error // Re-throw the error for further handling if needed
    }
  }

  static async getServiceById(id) {
    try {
      const response = await customFetch.get(`/services/${id}`)
      return response.data
    } catch (error) {
      // Improved error message to include status code if available
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.msg ||
            error.response.statusText ||
            'An unknown error occurred.'
          }`
        : error.message ||
          `Failed to connect to the server or fetch service with ID: ${id}.`
      toast.error(errorMessage)
      throw error
    }
  }

  static async getServiceBySlug(slug) {
    try {
      const response = await customFetch.get(`/services/slug/${slug}`)
      return response.data
    } catch (error) {
      // Improved error message to include status code if available
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.msg ||
            error.response.statusText ||
            'An unknown error occurred.'
          }`
        : error.message ||
          `Failed to connect to the server or fetch service with slug: ${slug}.`
      toast.error(errorMessage)
      throw error
    }
  }

  static async getServiceCategories() {
    try {
      const response = await customFetch.get('/services/categories')
      return response.data
    } catch (error) {
      // Improved error message to include status code if available
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.msg ||
            error.response.statusText ||
            'An unknown error occurred.'
          }`
        : error.message ||
          'Failed to connect to the server or fetch service categories.'
      toast.error(errorMessage)
      throw error
    }
  }

  static async searchServices(query, params = {}) {
    try {
      // Axios automatically encodes query parameters
      const response = await customFetch.get(`/services/search/${query}`, {
        params,
      })
      return response.data
    } catch (error) {
      // Improved error message to include status code if available
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.msg ||
            error.response.statusText ||
            'An unknown error occurred.'
          }`
        : error.message ||
          `Failed to connect to the server or search services for: ${query}.`
      toast.error(errorMessage)
      throw error
    }
  }

  static async incrementViewCount(id) {
    try {
      const response = await customFetch.post(`/services/${id}/view`)
      return response.data
    } catch (error) {
      // Improved error message to include status code if available
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.msg ||
            error.response.statusText ||
            'An unknown error occurred.'
          }`
        : error.message ||
          `Failed to connect to the server or increment view count for service: ${id}.`
      toast.error(errorMessage)
      throw error
    }
  }
}
