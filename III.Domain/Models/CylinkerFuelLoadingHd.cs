using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CYLINKER_FUEL_LOADING_HD")]
    public class CylinkerFuelLoadingHd
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        public string TicketTitle { get; set; }

        [StringLength(255)]
        public string TicketCreator { get; set; }

        public DateTime? TicketCreatedTime { get; set; }

        [StringLength(255)]
        public string Loader { get; set; }

        public DateTime? LoaderTime { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public string Note { get; set; }
    }
}
