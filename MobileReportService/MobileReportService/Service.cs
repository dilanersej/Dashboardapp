using MobileReportService.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
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


        public List<string> GetData(DataModel model)
        {
            string query = model.Query;
            ArrayList al = new ArrayList();
            List<dynamic> actualList = new List<dynamic>();

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

                while (reader.Read())
                {
                    object[] values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    al.Add(values);

                    
                    for(int j = 0; j < values.Length; j++){
                        dynamic objClass = new ExpandoObject();
                        
                        //CREATE THE OBJECT WITH ALL PROPS
                        for(int i = 0; i < values.Length; i++){
                            var key = columns[i].ToString();
                            objClass.key = values[i];
                        }

                        actualList.Add(objClass);
                    }

                }

                // Call Close when done reading.
                reader.Close();
                return null;
            }
        }
    }
}
