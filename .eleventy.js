module.exports = function(eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Create a collection for all events (sorted by date ascending)
  eleventyConfig.addCollection("events", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/events/*.md")
      .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
  });

  // Auto-populate upcoming events (date >= today)
  eleventyConfig.addCollection("upcomingEvents", function(collectionApi) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return collectionApi.getFilteredByGlob("src/events/*.md")
      .filter(item => new Date(item.data.date) >= now)
      .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
  });

  // Auto-populate past events (date < today)
  eleventyConfig.addCollection("pastEvents", function(collectionApi) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return collectionApi.getFilteredByGlob("src/events/*.md")
      .filter(item => new Date(item.data.date) < now)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Date filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  });

  eleventyConfig.addFilter("shortDate", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  });

  eleventyConfig.addFilter("monthDay", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  });

  eleventyConfig.addFilter("year", (dateObj) => {
    return new Date(dateObj).getFullYear();
  });

  eleventyConfig.addFilter("dayOfWeek", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  });

  // Check if a date is in the future
  eleventyConfig.addFilter("isFuture", (dateObj) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(dateObj) >= now;
  });

  // Limit filter
  eleventyConfig.addFilter("limit", (arr, count) => {
    return arr.slice(0, count);
  });

  return {
    pathPrefix: "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
