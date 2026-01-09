export interface Project {
  grade: string;
  title: string;
  type: string;
  slug: string;
  modalWidth?: number;
  bannerSrc: string;
  action: 'route' | 'modal';
  linkHref?: string;
  description?: string;
}
