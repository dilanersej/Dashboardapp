using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace MobileReportService
{
    
    public class Service : IService
    {
        public string Test(string name)
        {
          using (var db = new ReportEntities())
          {
              string str = db.Database.SqlQuery<string>("SELECT CAST(CAST(Content AS VARBINARY(MAX)) AS XML) AS DashboardXML FROM ReportServer$SRVSQL2012.dbo.Catalog WHERE Name = 'DannyTest.xml'").FirstOrDefault<string>();
              return str;
          }
        }
    }
}
