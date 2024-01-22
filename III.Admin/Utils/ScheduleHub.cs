using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public class ScheduleHub:Hub
    {
        public async Task SendClientData(string action, object data)
        {
            await Clients.All.SendAsync("ReceiveData", action, data);
        }
    }
}
