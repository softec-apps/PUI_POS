import { useTemplate } from '@/common/hooks/useTemplate';
import { I_Template } from '@/modules/template/types/template';
import { useState, useEffect } from 'react';

export const useProductTemplate = () => {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templatesData, setTemplatesData] = useState<I_Template[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const {
    template: templates,
    loading: loadingTemplates,
    refetchTemplate: refetchTemplates,
    getTemplateById,
  } = useTemplate({
    page: 1,
    limit: 5,
    search: templateSearch,
  });

  useEffect(() => {
    if (templates?.data.items) {
      const newTemplates = templates.data.items.filter(
        (template) => !templatesData.some((existing) => existing.id === template.id)
      );
      setTemplatesData((prev) => [...prev, ...newTemplates]);
    }
  }, [templates]);

  const fetchTemplates = ({ search, page, limit }) => {
    setTemplateSearch(search)
    refetchTemplates()
  }

  const loadMoreTemplates = () => {
    if (
      templates &&
      templates.data.pagination.page < templates.data.pagination.pageCount
    ) {
      refetchTemplates();
    }
  };

  return {
    templateOpen,
    setTemplateOpen,
    templatesData,
    loadingTemplates,
    templateSearch,
    setTemplateSearch,
    loadMoreTemplates,
    fetchTemplates,
    getTemplateById,
  };
};
