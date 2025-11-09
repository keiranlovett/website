# keiran.me

This repository contains the Jekyll theme and content of my blog.

### Want to use this theme?

* Remove the existing content

```bash
$ rm -rf _drafts _pages _posts _qualifications _talks _works/*.md CNAME
```

* Edit the details from `_config.yml`.
* Change title in `index.html`

## Running

### Prereqs

```bash
rbenv install 3.3.0    # if not installed
rbenv local 3.3.0
gem install bundler -v 2.5.22
bundle config set --local path vendor/bundle
bundle install
```

You can simply run the whole project with this command :

```bash
$ bundle exec Jekyll serve
```

Open: `http://127.0.0.1:4000`
Common flags you might want:
	•	`--drafts` (show posts in _drafts/)
	•	`--future` (render future-dated posts)
	•	`--unpublished` (render unpublished collections)
	•	`--incrementa`l` (faster rebuilds)

### VSCode

`.vscode/tasks.json` provides:
- `Bundle: Install` bundle install into vendor/bundle
- `Jekyll: Serve` bundle exec jekyll serve --livereload (opens Safari automatically)
- `Jekyll: Build` production build
- `Doctor: Env` prints which Ruby/Bundle VS Code is using