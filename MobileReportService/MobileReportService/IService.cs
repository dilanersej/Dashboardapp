using MobileReportService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Xml.Linq;

namespace MobileReportService
{
    
    [ServiceContract]
    public interface IService
    {
        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat=WebMessageFormat.Xml, UriTemplate="/test/{name}")]
        XElement Test(string name);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Xml, UriTemplate = "/test2")]
        XElement GetData(DataModel model);
    }
}
