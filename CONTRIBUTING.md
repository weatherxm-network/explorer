# Welcome to WeatherXM's Explorer App contributing guide.

First of all, thank you for investing your time to contribute in WeatherXM! Any contribution you
make will be reflected on
our [WeatherXM Explorer](https://explorer.weatherxm.com).

We use **[GitHub Flow](https://githubflow.github.io/)** as our branching model.

In this guide you will get an overview of the contribution workflow from opening an issue, creating
a PR, reviewing, and merging the PR.

## Table Of Contents

[Code of Conduct](#code-of-conduct)

[Building the app](#building--environment)

- [Environment Setup](#environment-setup)
- [Different Flavors](#different-flavors)
- [Building](#building)

[How to ask a question, report a bug or suggest a potential new feature/improvement?](#how-to-ask-a-question-report-a-bug-or-suggest-a-potential-new-featureimprovement)

- [Do you have a question](#do-you-have-a-question)
- [Reporting Bugs](#did-you-find-a-bug)
- [Suggesting Enhancements](#do-you-want-to-suggest-a-potential-improvement-or-a-new-feature)

[How to Contribute?](#how-to-contribute)

[Styleguide](#styleguide)

[Additional Notes](#additional-notes)

- [Issue Labels](#issue-labels)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](https://github.com/WeatherXM/explorer/blob/main/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code to keep our community approachable and
respectable.

## Building & Environment

### Environment Setup

All contributors could use any IDE platform or code editor they want as long as they use the appropriate linter ([eslint](https://eslint.org)) and code formatter ([prettier](https://prettier.io)) as their config files exist inside the project's root folder.

### Building

To build the app from source, you need to create a `.env` file in the root directory, according to the `.env.template` and make sure to fill in all the required variables. Then, install all the required dependencies by running one of the following commands:

#### npm

```bash
npm install
```

#### yarn

```bash
yarn install
```

After the above steps you could start the development server on `http://localhost:3001` by running one of the following commands:

#### npm

```bash
npm run dev
```

#### yarn

```bash
yarn dev
```

If you want to customize the `port` and `address` of dev server, just change the dev server settings in the `nuxt.confing.ts` file.

> [!IMPORTANT]
> Be aware that the use of FontAwesome Pro icons requires a valid Font Awesome Pro license. Font Awesome Pro is a premium icon set that provides additional features and icons beyond the free version. However, if you do not own a Font Awesome Pro license, feel free to replace the icons with those from an alternative font package or your custom icons.

### Different Flavors

We have 3 different app flavors (consider flavors as different “build variants”). For each flavor a
different `.env` file can be created for different environment variables, such as `API_URL`.

The 3 different app flavors are:

1. **Remote Mock:** This flavor communicates with our **remote mock API**.
   **Currently only for internal use.**

2. **Remote Dev**: This flavor communicates with our **dev API**.
   **Currently only for internal use.**

3. **Remote Prod:** This flavor communicates with our **production API**, found
   on `app.weatherxm.com`. The `API_URL` on that environment file should
   be [https://api.weatherxm.com](https://api.weatherxm.com)

## How to ask a question, report a bug or suggest a potential new feature/improvement?

### **Do you have a question?**

- **Ensure your question was not already asked** by searching on GitHub
  under [Issues](https://github.com/WeatherXM/explorer/issues) under the
  label _Question_.

- If you're unable to find a response to your
  question , [open a new issue](https://github.com/WeatherXM/explorer/issues/new) by using
  the [**Ask a question** template](https://github.com/WeatherXM/explorer/blob/main/.github/ISSUE_TEMPLATE/ask_a_question.md).
  Using this template is mandatory. Make sure to have a **clear title** and include as many details
  as possible as that information helps to answer your question as soon as possible.

### **Did you find a bug?**

- **Ensure the bug was not already reported** by searching on GitHub
  under [Issues](https://github.com/WeatherXM/explorer/issues) under the label
  _Bug_.

- If you're unable to find an open issue addressing the
  problem, [open a new issue](https://github.com/WeatherXM/explorer/issues/new) by using
  the [**Bug Report** template](https://github.com/WeatherXM/explorer/blob/main/.github/ISSUE_TEMPLATE/bug_report.md).
  Using this template is mandatory. Make sure to have a **clear title** and include as many details
  as possible as that information helps to resolve issues faster.

### **Do you want to suggest a potential improvement or a new feature?**

- **Ensure this suggestion was not already reported** by searching on GitHub
  under [Issues](https://github.com/WeatherXM/explorer/issues) under the
  label _Enhancement_.

- If you're unable to find that
  suggestion, [create a new issue](https://github.com/WeatherXM/explorer/issues/newhttps://github.com/WeatherXM/beta-issue-tracker/issues/new/choose)
  by using the [**Feature Request** template](https://github.com/WeatherXM/explorer/blob/main/.github/ISSUE_TEMPLATE/feature_request.md).
  Using this template is mandatory. Make sure to have a **clear title** and include as many details
  as possible.

## How to contribute?

We are open to contributions on [current issues](https://github.com/WeatherXM/explorer/issues),
if the bug/feature/improvement you would like to work on isn't documented, please open a new issue
so we can approve it before you start working on it.

### Fix a bug, implement a new feature or conduct an optimization

Scan through our existing [issues](https://github.com/WeatherXM/explorer/issues) to find one that
interests you (or create a new one). You can narrow down the search using `labels` as filters.
See [Issue Labels](#issue-labels) for more information. Please don't start working
on issues that are currently assigned to someone else or have the `in-progress` label. If you find
an issue to work on, please comment in it to get it assigned to you and you are welcome to open a PR
with a fix/implementation.

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.

- Fill the "Ready for review" template so that we can review your PR. This template helps reviewers
  understand your changes as well as the purpose of your pull request.
- Don't forget
  to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
  if you are solving one.
- Enable the checkbox
  to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork)
  so the branch can be updated for a merge.
  Once you submit your PR, a WeatherXM team member will review your PR. We may ask questions or
  request additional information.
- We may ask for changes to be made before a PR can be merged. You can implement those changes in
  your fork, then commit them to your branch in order to update the PR.
- As you update your PR and apply changes, mark each conversation
  as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).

### Your PR is merged!

Congratulations 🥳 The WeatherXM team thanks you! We really appreciate your effort and help! ♥️

Once your PR is merged, your contributions will be publicly visible on
our [WeatherXM Explorer](https://explorer.weatherxm.com) on the next
release.

## Styleguide

We use **[Github Flow](https://githubflow.github.io/)** as our branching model and _Clean
Architecture_.

## Additional Notes

### Issue Labels

This section lists the labels we use to help us track and manage issues.

#### Type of Issue Labels

| Label name        | Description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `enhancement`     | New feature request or improvement                                        |
| `bug`             | Confirmed bugs or reports that are very likely to be bugs.                |
| `question`        | Questions more than bug reports or feature requests (e.g. how do I do X). |
| `in-progress`     | A bug, feature or improvement that is currently a Work-In-Progress.       |
| `needs-attention` | An issue that needs attention to be put under specific categories/labels. |
| `wontfix`         | An issue that won't be worked on.                                         |
