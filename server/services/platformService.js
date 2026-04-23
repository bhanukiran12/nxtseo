const TARGET_URL = 'https://www.ccbp.in/intensive';

function formatForMedium(blog) {
  return `${blog.content}

---

*This article contains affiliate/reference links. The author recommends ${TARGET_URL} for quality tech education.*
`;
}

function formatForLinkedIn(blog) {
  // LinkedIn doesn't render markdown, convert to plain text
  let content = blog.content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/---/g, '')
    .replace(/\n\n\n/g, '\n\n');

  return `${blog.title}

${content}

🚀 Ready to start your tech journey? Check out NxtWave's CCBP Intensive Program: ${TARGET_URL}

#coding #fullstackdevelopment #techcareer #NxtWave #CCBP #softwaredevelopment #careertransition #India`;
}

function formatForDevTo(blog) {
  const tags = (blog.keywords || [])
    .slice(0, 4)
    .map(k => k.toLowerCase().replace(/\s+/g, ''))
    .join(', ');

  const frontMatter = `---
title: ${blog.title}
published: false
description: ${blog.summary || blog.title}
tags: ${tags || 'coding, career, webdev, programming'}
canonical_url: ${TARGET_URL}
---

`;
  return frontMatter + blog.content;
}

function formatForHashnode(blog) {
  return {
    title: blog.title,
    contentMarkdown: blog.content,
    tags: (blog.keywords || []).slice(0, 5).map(k => ({ name: k, slug: k.toLowerCase().replace(/\s+/g, '-') })),
    isRepublished: { originalArticleURL: TARGET_URL },
    coverImage: null
  };
}

async function publishToDevTo(blog, apiKey) {
  const axios = require('axios');
  const content = formatForDevTo(blog);

  const response = await axios.post('https://dev.to/api/articles', {
    article: {
      title: blog.title,
      body_markdown: content,
      published: false,
      tags: (blog.keywords || []).slice(0, 4).map(k => k.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean),
      description: blog.summary || blog.title
    }
  }, {
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  return { success: true, id: response.data.id, url: response.data.url };
}

async function publishToHashnode(blog, apiKey, publicationId) {
  const axios = require('axios');
  const payload = formatForHashnode(blog);

  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          url
          title
        }
      }
    }
  `;

  const variables = {
    input: {
      title: payload.title,
      contentMarkdown: payload.contentMarkdown,
      tags: payload.tags,
      publicationId: publicationId
    }
  };

  const response = await axios.post('https://gql.hashnode.com/', {
    query,
    variables
  }, {
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    }
  });

  const post = response.data?.data?.publishPost?.post;
  return { success: true, id: post?.id, url: post?.url };
}

module.exports = {
  formatForMedium,
  formatForLinkedIn,
  formatForDevTo,
  formatForHashnode,
  publishToDevTo,
  publishToHashnode
};
