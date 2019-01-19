let environments={}

environments.stagging = {
    'httpPort' : 3000,
    'envName' : 'stagging',
    'hashingSecret' : 'thisIsASecret',
    'stripe_api_key': '',
    'mailgun_api_key': '',
    'mailgun_domain': '',
    'acceptedCreditCards': ['amex','mastercard','visa'],
  };

  environments.prod = {
    'httpPort' : 5000,
    'envName' : 'prod',
    'hashingSecret' : 'thisIsASecret',
    'stripe_api_key': '',
    'mailgun_api_key': '',
    'mailgun_domain': '',
    'acceptedCreditCards': ['amex','mastercard','visa'],
  };



module.exports=environments