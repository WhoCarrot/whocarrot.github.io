{% for drawing in site.drawings %}
  <h2>{{ drawing.name }} - {{ drawing.date }}</h2>
  <p>{{ drawing.content | markdownify }}</p>
{% endfor %}