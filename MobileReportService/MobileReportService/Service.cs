using MobileReportService.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
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


        public ArrayList GetData(DataModel model)
        {
            string query = model.Query;
            ArrayList al = new ArrayList();

            using (SqlConnection sqlConnect = new SqlConnection())
            {
                sqlConnect.ConnectionString = new ConnectionStringBuilder().CsBuilder(model);

                SqlCommand command = new SqlCommand(query, sqlConnect);
                sqlConnect.Open();

                SqlDataReader reader = command.ExecuteReader();

                while (reader.Read())
                {
                    object[] values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    al.Add(values);

                }

                // Call Close when done reading.
                reader.Close();
                return al;
            }
        }
    }
}
