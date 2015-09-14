using MobileReportService.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.Xml.Linq;

namespace MobileReportService
{
    
    public class Service : IService
    {
        public XElement Test(string name)
        {
          using (var db = new ReportEntities())
          {
              XElement xelement = XElement.Parse(db.Database.SqlQuery<string>("SELECT CAST(CAST(Content AS VARBINARY(MAX)) AS XML) AS DashboardXML FROM ReportServer$SRVSQL2012.dbo.Catalog WHERE Name = '" + name + ".xml'").FirstOrDefault<string>());
              return xelement;
          }
        }


        public XElement GetData(DataModel model)
        {
            using (SqlConnection sqlConnect = new SqlConnection())
            {
                sqlConnect.ConnectionString = new ConnectionStringBuilder().CsBuilder(model);
                SqlCommand getdata = new SqlCommand("SELECT * FROM ***INSTERTABLENAME**");
                using (SqlDataReader reader = getdata.ExecuteReader())
                {

                }
            } 
        }
    }
}
