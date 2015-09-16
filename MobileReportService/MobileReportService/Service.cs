using MobileReportService.Models;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Web.Script.Serialization;
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


        public List<Dictionary<string, object>> GetData(DataModel model)
        {
            string query = model.Query;
            ArrayList al = new ArrayList();

            using (SqlConnection sqlConnect = new SqlConnection())
            {
                sqlConnect.ConnectionString = new ConnectionStringBuilder().CsBuilder(model);

                SqlCommand command = new SqlCommand(query, sqlConnect);
                sqlConnect.Open();

                SqlDataReader reader = command.ExecuteReader();

                var columns = new List<string>();

                for (int i = 0; i < reader.FieldCount; i++)
                {
                    columns.Add(reader.GetName(i));
                }

                var list = new List<Dictionary<string, object>>();

                while (reader.Read())
                {
                    object[] values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    var item = new Dictionary<string, object>();
                    for (int i = 0; i < columns.Count; i++)
                    {
                        var columnName = columns[i];
                        var value = values[i];
                        item[columnName]= value;
                    }
                    list.Add(item);
                }
                reader.Close();
                return list;
            }
        }
    }
}
