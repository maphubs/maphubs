//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
}

export default class Privacy extends MapHubsComponent<Props, void> {

  props: Props

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
      return (
        <div>
          <Header {...this.props.headerConfig}/>
          <main className="container" lang="en">
            <div className="row">
              <h4>{MAPHUBS_CONFIG.productName + ' ' + this.__('Privacy Policy')}</h4>
  <p>
  We respect your privacy and will not share your information other than in the circumstances outlined below.
  </p>

  <h5>{MAPHUBS_CONFIG.productName} Public Beta</h5>

  <p>
  {MAPHUBS_CONFIG.productName} is currently offered as public beta software. We do not guarantee that the application is 100% free of bugs or issues that may impact privacy.  You use the {MAPHUBS_CONFIG.productName} service at your own risk. Please see our Terms of Service for more information.
  </p>
  <h5>General Information</h5>
  <p>
  We collect the e-mail addresses of those who communicate with us via e-mail, aggregate information on what pages consumers access or visit, and information volunteered by the consumer (such as survey information and/or site registrations). We may collect and store your Internet Protocol address, and information about your computer/mobile device, such as the model, and web browser version.
  </p>
  <p>
  The information we collect is used to improve the content of our Web pages and the quality of our service, and is not shared with or sold to other organizations for commercial purposes, except to provide products or services you&#39;ve requested, when we have your permission, or under the following circumstances:
  </p>
  <ol>
  <li>
  It is necessary to share information in order to investigate, prevent, or take action regarding illegal activities, suspected fraud, situations involving potential threats to the physical safety of any person, violations of Terms of Service, or as otherwise required by law.
  </li>
  <li>
  We transfer information about you if {MAPHUBS_CONFIG.productName} is acquired by or merged with another company. In this event, {MAPHUBS_CONFIG.productName} will notify you before information about you is transferred and becomes subject to a different privacy policy.
  </li>
  </ol>
  <h5>Information Gathering and Usage</h5>
  <p>
  When you register for {MAPHUBS_CONFIG.productName} we ask for information such as your name, and email address. {MAPHUBS_CONFIG.productName} uses collected information for the following general purposes: products and services provision, identification and authentication, services improvement, contact, and research.
</p>
  <p>
  In order to better understand our users, we have implemented Google Analytics features based on Display Advertising  (Google Analytics Demographics and Interest Reporting). You can opt-out of Google Analytics for Display Advertising and customize Google Display Network ads using the Ads Settings. In addition, you can use the Google Analytics Opt-Out Browser Add-on to disable tracking by Google Analytics.
</p>
  <h5>Cookies</h5>
  <p>
  Cookies are required to use the {MAPHUBS_CONFIG.productName} service. A cookie is a small amount of data, which often includes an anonymous unique identifier, that is sent to your browser from a web site&#39;s computers and stored on your computer&#39;s hard drive.
</p>
  <p>
  We use cookies to record current session information, but do not use permanent cookies. You are required to re-login to your {MAPHUBS_CONFIG.productName} account after a certain period of time has elapsed to protect you against others accidentally accessing your account contents.
</p>
  <p>
  Some third-party services that we use, such as Google Analytics, may place their own cookies in your browser. This Privacy Policy covers use of cookies by {MAPHUBS_CONFIG.productName} only and not the use of cookies by third parties.
</p>
  <h5>Third Party Services</h5>
  <p>
  The user login and authentication system for {MAPHUBS_CONFIG.productName} is provided by Auth0 https://auth0.com/. 
</p>
  <p>
  The help form (Send a Message button) is provided by HelpScout. Use of the help form is also a transaction with HelpScout. More information on HelpScout&#39;s policy is available at https://www.helpscout.net/company/privacy/
</p>
  <p>
  {MAPHUBS_CONFIG.productName} layers may link to external map services services hosted by other organizations. This Privacy Policy does not cover usage information collected by map services external to {MAPHUBS_CONFIG.productName}.
</p>
  <h5>Data Storage</h5>
  <p>
  {MAPHUBS_CONFIG.productName} uses third-party vendors and cloud hosting services to provide the necessary hardware, software, networking, storage, and related technology required to run {MAPHUBS_CONFIG.productName}. While {MAPHUBS_CONFIG.productName} controls these systems, you retain all rights to your data. {MAPHUBS_CONFIG.productName} uses the open-source software, MapHubs. MapHubs, Incorporated owns the MapHubs brand, and the copyright to the code. The MapHubs source code is open source, and can be on private networks or self hosted using on-premise servers. MapHubs offers consulting and support services, please contact us for assistance running your own instance of the MapHubs application.
  </p>
  <h5>Data security</h5>
  <p>
  We offer encryption (HTTPS/TLS) to protect data transmitted to and from our site, and require it for login and passwords. However, no data transmission over the Internet is 100% secure, so we can’t guarantee security. You use {MAPHUBS_CONFIG.productName} at your own risk, and you’re responsible for taking reasonable measures to secure your account (like using a strong password).
  </p>
  <h5>Disclosure</h5>
  <p>
  {MAPHUBS_CONFIG.productName} may disclose personally identifiable information under special circumstances, such as to comply with subpoenas or when your actions violate the Terms of Service.
  </p>
  <h5>EU and Swiss Residents</h5>
  <p>
  If you choose to provide {MAPHUBS_CONFIG.productName} with your information, you consent to the transfer and storage of that information on our servers located in the United States and Germany.
  </p>
  <p>
  For European Union and Swiss residents, any questions or concerns regarding the use or disclosure of your information should be directed to {MAPHUBS_CONFIG.productName} by sending an email to {MAPHUBS_CONFIG.contactEmail}. We will investigate and attempt to resolve complaints and disputes regarding use and disclosure of your information in accordance with this Privacy Policy. For complaints that cannot be resolved, we have committed to cooperate with data protection authorities located within Switzerland or the European Union (or their authorized representatives).
  </p>
  <h5>Emails</h5>
  <p>
  {MAPHUBS_CONFIG.productName} will occasionally send administrative emails about account or service changes, or new policies.
  </p>
  <h5>Changes</h5>
  <p>
  {MAPHUBS_CONFIG.productName} may periodically update this policy. We will notify you about significant changes in the way we treat personal information by sending a notice to the primary email address specified in your {MAPHUBS_CONFIG.productName} account or by placing a prominent notice on our site.
  </p>
  <h5>Questions</h5>
  <p>
  Any questions about this Privacy Policy should be addressed to {MAPHUBS_CONFIG.contactEmail}.
  </p>

            </div>

          </main>
          <Footer {...this.props.footerConfig}/>
        </div>
      );


  }
}
