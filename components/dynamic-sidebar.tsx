import dynamic from 'next/dynamic';
import React from 'react';

const DynamicSidebar = dynamic(() => import('./sidebar'), {
  ssr: false, // Ensure this component is only rendered on the client side
});

interface DynamicSidebarProps {
  className?: string;
}

export default function DynamicSidebarComponent(props: DynamicSidebarProps) {
  return <DynamicSidebar {...props} />;
}
