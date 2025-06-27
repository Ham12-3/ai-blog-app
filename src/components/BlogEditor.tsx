'use client'

import MarkdownEditor from './MarkdownEditor'

interface BlogEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
  return (
    <MarkdownEditor
      value={content}
      onChange={onChange}
      placeholder="Start writing your blog post... You can use Markdown formatting and insert images!"
    />
  )
} 