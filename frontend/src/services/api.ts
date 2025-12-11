import type {
  Project,
  Slide,
  GenerateOutlineRequest,
  GenerateSlideImageRequest,
  ApiResponse,
} from '../types';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error ${response.status}`,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const apiService = {
  // Document parsing
  async parseDocument(file: File): Promise<ApiResponse<{ content: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/document/parse`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },

  // Generate outline
  async generateOutline(
    params: GenerateOutlineRequest
  ): Promise<ApiResponse<Project>> {
    return request<Project>('/project/generate-outline', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Update slide
  async updateSlide(
    slideId: string,
    updates: Partial<Slide>
  ): Promise<ApiResponse<Slide>> {
    return request<Slide>(`/slide/${slideId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Generate slide image
  async generateSlideImage(
    params: GenerateSlideImageRequest
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    return request<{ imageUrl: string }>('/slide/generate-image', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Export PDF
  async exportPdf(projectId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return request<{ downloadUrl: string }>(`/export/pdf/${projectId}`, {
      method: 'POST',
    });
  },

  // Get project
  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return request<Project>(`/project/${projectId}`);
  },
};

