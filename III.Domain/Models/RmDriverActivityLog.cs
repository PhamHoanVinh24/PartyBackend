using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_DRIVER_ACTIVITY_LOG")]
    public class RmDriverActivityLog
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string UserName { get; set; }

        public string CdataJson { get; set; }

        public DateTime? UpdateTime { get; set; }

        public DateTime? SysDate { get; set; }
        public string NodeGIS { get; set; }
        public int DriverId { get; set; }

    }
}

