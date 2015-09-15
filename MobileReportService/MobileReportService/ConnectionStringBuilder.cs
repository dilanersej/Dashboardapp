using MobileReportService.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportService
{
    public class ConnectionStringBuilder
    {

        public string CsBuilder(DataModel model)
        {
            SqlConnection myConnection = new SqlConnection();

            SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();

            builder.UserID = model.Parameters[5].Value;
            builder.Password = model.Parameters[6].Value;
            builder.InitialCatalog = model.Parameters[1].Value;
            builder.DataSource = model.Parameters[0].Value;
            builder.ConnectTimeout = 30;
            return builder.ConnectionString;
        }
    }
}
