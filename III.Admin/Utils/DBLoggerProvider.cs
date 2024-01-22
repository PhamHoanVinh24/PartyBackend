using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using ESEIM.Models;
using Host.DbContexts;

namespace ESEIM.Utils
{
    public class LoggingEvents
    {
        public const int LogDb = -1;
    }

    public class DBLoggerProvider : ILoggerProvider
    {
        private readonly Func<string, LogLevel, bool> _filter;
        private IHttpContextAccessor _accessor;

        public DBLoggerProvider(Func<string, LogLevel, bool> filter, IHttpContextAccessor accessor)
        {
            _filter = filter;
            _accessor = accessor;
        }

        public ILogger CreateLogger(string categoryName)
        {
            return new DBLogger(categoryName, _filter, _accessor);
        }

        public void Dispose()
        {
        }
    }

    public class DBLogger : ILogger
    {
        private string _categoryName;
        private Func<string, LogLevel, bool> _filter;
        private IHttpContextAccessor _accessor;
        private int MessageMaxLength = 4000;
        private EIMDBContext _context;

        public DBLogger(string categoryName, Func<string, LogLevel, bool> filter, IHttpContextAccessor accessor)
        {
            _categoryName = categoryName;
            _filter = filter;
            _accessor = accessor;
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                return;
            }
            if (formatter == null)
            {
                throw new ArgumentNullException(nameof(formatter));
            }
            var message = formatter(state, exception);
            if (string.IsNullOrEmpty(message))
            {
                return;
            }

            if (exception != null)
            {
                message += "\n" + exception.ToString();
            }
            message = message.Length > MessageMaxLength ? message.Substring(0, MessageMaxLength) : message;

            if (eventId.Id == LoggingEvents.LogDb)
            {
                // Insert log to database
                AdActionLog actionLog = new AdActionLog(_accessor);
                actionLog.LogLevel = logLevel.ToString();
                actionLog.Message = message;
                //actionLog.Data = "";

                _context = _accessor.HttpContext.RequestServices.GetService<EIMDBContext>();
                _context.AdActionLogs.Add(actionLog);
                _context.SaveChanges();
            }
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            return (_filter == null || _filter(_categoryName, logLevel));
        }

        public IDisposable BeginScope<TState>(TState state)
        {
            return null;
        }
    }

    public static class DBLoggerExtensions
    {
        public static ILoggerFactory AddContext(this ILoggerFactory factory, IHttpContextAccessor accessor,
         Func<string, LogLevel, bool> filter = null)
        {
            factory.AddProvider(new DBLoggerProvider(filter, accessor));
            return factory;
        }

        public static ILoggerFactory AddContext(this ILoggerFactory factory, LogLevel minLevel, IHttpContextAccessor accessor)
        {
            return AddContext(factory, accessor, (_, logLevel) => logLevel >= minLevel);
        }
    }
}