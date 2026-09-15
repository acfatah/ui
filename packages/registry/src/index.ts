/*
  Repository-convenience barrel. Components re-export from here as they
  land. Consumers never import it: each module is its own registry item,
  addressed by its own path, and a barrel import would drag the whole
  directory into an install.
*/

export {}
