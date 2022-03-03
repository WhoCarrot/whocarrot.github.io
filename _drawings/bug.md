---
name: Heyooooo I'm a fucken bug
date: March 2022
---
{% assign image_files = site.static_files | where: "image", true %}
{% for myimage in image_files %}
  {{ myimage.path }}
{% endfor %}