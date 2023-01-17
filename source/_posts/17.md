---
title: Amazon SP program signature problem
date: 1655226856000
tags:
- DEV

url: https://github.com/bxb100/bxb100.github.io/issues/17

---
## Case

When us project execute [getListingsItem](https://developer-docs.amazon.com/sp-api/docs/listings-items-api-v2021-08-01-reference#getlistingsitem), using SKU name 'FBA XXX XX 300g', but Amazon returns 403 error. At first, we don't get message body like below, we just know it's not successful.
```json
{
  "errors": [
    {
      "message": "The request signature we calculated does not match the signature you provided. Check your AWS Secret Access Key and signing method. Consult the service documentation for details.

...
```

## Using Charles to debug

I suppose the HTTP protocol sends the right query param and uses the right path, but I don't know yet, so I choose using Charles to get information. First disable the SSL certificate verifier, and then add Charles proxy.

```java
private static OkHttpClient getUnsafeOkHttpClient() {
        try {
            // Create a trust manager that does not validate certificate chains
            final TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {
                    }

                    @Override
                    public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {
                    }

                    @Override
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return new java.security.cert.X509Certificate[]{};
                    }
                }
            };

            // Install the all-trusting trust manager
            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            // Create an ssl socket factory with our all-trusting manager
            final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

            OkHttpClient client = new OkHttpClient();
            client.setSslSocketFactory(sslSocketFactory);
            client.setHostnameVerifier(new HostnameVerifier() {
                @Override
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            });
            client.setProxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 9090)));
            return client;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
```

and then to execute method get error like this

![image](https://user-images.githubusercontent.com/20685961/173632004-2312ee7a-5cb0-4d43-b2c0-8b533b19b17f.png)

It's easy to know the problem occupy in the AWS signer, but why? The path is encoded (compared with postman data), and the signer is double encoding the path variable [^1] (`urlEncode` default is `true`)

```java
protected String getCanonicalizedResourcePath(String resourcePath, boolean urlEncode) {
        String value = resourcePath;
        if (urlEncode) {
            value = SdkHttpUtils.urlEncode(resourcePath, true);

            URI normalize = URI.create(value).normalize();
            value = normalize.getRawPath();

            // Normalization can leave a trailing slash at the end of the resource path,
            // even if the input path doesn't end with one. Example input: /foo/bar/.
            // Remove the trailing slash if the input path doesn't end with one.
            if (!resourcePath.endsWith("/") && value.endsWith("/")) {
                value = value.substring(0, value.length() - 1);
            }
        }
        if (!value.startsWith("/")) {
            value = "/" + value;
        }
        return value;
    }
```

Obviously, the code is right, it must be some places give the wrong parameter.

## Debug

The best way to pinpoint the breakpoints is the line where the nearest the mistake.
So, give the `AWSSigV4Signer#sign` one, and start debug session, take a deep look. few methods passed, suddenly I found the `path` in `createCanonicalRequest` not right, it's just a plain text of the test sets.

Why?

You know the `createCanonicalRequest` is the first step, they need encode twice, if you passed a path without encode, then the `aws-sdk` maximum encode once.

![image](https://user-images.githubusercontent.com/20685961/173635120-5dffa3d0-5046-4bce-b6e4-9df1fd6092c3.png)

Now, you can clearly find the problem is `request.getResourcePath()` 

```java
  @Override
  public String getResourcePath() {
    try {
      return originalRequest.url().toURI().getPath();
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }
```

and 

```java
    /**
     * Returns the decoded path component of this URI.
     *
     * <p> The string returned by this method is equal to that returned by the
     * {@link #getRawPath() getRawPath} method except that all sequences of
     * escaped octets are <a href="#decode">decoded</a>.  </p>
     *
     * @return  The decoded path component of this URI,
     *          or {@code null} if the path is undefined
     */
    public String getPath() {
        #...
    }
```

it's so simple, but costed me a bunch of time to solve, feel sad 😢 

bless me to be better 🤞 


[^1]: https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html#:~:text=Each%20path%20segment%20must%20be%20URI%2Dencoded%20twice