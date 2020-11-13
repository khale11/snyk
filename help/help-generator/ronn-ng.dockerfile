FROM ruby

RUN gem install ronn-ng --development

ENTRYPOINT ["/usr/local/bundle/bin/ronn"]
